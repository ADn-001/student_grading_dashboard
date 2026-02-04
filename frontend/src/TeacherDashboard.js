// Teacher dashboard: Horizontal course cards, clickable to show student table
// Table: email, name, current grade (now numeric), new grade input (number)
// Master Update button batches all changes
// Updated: Changed grade handling from letters to numbers (0-100)

import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchUsers, updateUser } from './api';
import Navbar from './Navbar';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);  // For student names
  const [selectedCourse, setSelectedCourse] = useState(null);  // Toggle table
  const [pendingGrades, setPendingGrades] = useState({});  // { 'course-studentEmail': newGrade }

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    setTeacherData(storedUser);

    const loadData = async () => {
      setCourses(await fetchCourses());
      setUsers(await fetchUsers());
    };
    loadData();
  }, []);

  if (!teacherData) return <p>Loading...</p>;

  const taughtCourses = courses.filter(c => teacherData.coursesTaught?.includes(c.name));

  const handleGradeChange = (courseName, studentEmail, newGrade) => {
    // Allow empty string (to clear) or valid number
    const value = newGrade === '' ? null : Number(newGrade);
    if (value !== null && (isNaN(value) || value < 0 || value > 100)) {
      return; // silently ignore invalid input
    }
    setPendingGrades(prev => ({
      ...prev,
      [`${courseName}-${studentEmail}`]: value
    }));
  };

  const handleUpdateAll = async () => {
    const updates = [];
    Object.entries(pendingGrades).forEach(([key, newGrade]) => {
      if (newGrade !== undefined) {  // Allow null to clear grade
        const [courseName, studentEmail] = key.split('-');
        const student = users.find(u => u.email === studentEmail && u.role === 'student');
        if (student) {
          const updatedCourses = student.currentCourses.map(c =>
            c.courseName === courseName ? { ...c, grade: newGrade } : c
          );
          updates.push(updateUser(student._id, { currentCourses: updatedCourses }));
        }
      }
    });

    try {
      await Promise.all(updates);
      setPendingGrades({});  // Clear after success
      alert('Grades updated successfully');
      // Optional: refresh data here if you want immediate UI update
    } catch (err) {
      console.error('Batch update error:', err);
      alert('Failed to update some grades');
    }
  };

  return (
    <div>
      {/* <Navbar /> */}
      <h1>Teacher Dashboard</h1>
      <div className="horizontal-flex">
        {taughtCourses.map(course => (
          <div
            key={course._id}
            className="card"
            style={{ cursor: 'pointer', width: '200px' }}
            onClick={() => setSelectedCourse(selectedCourse === course.name ? null : course.name)}
          >
            <h3>{course.name}</h3>
            <p>Enrolled: {course.enrolledStudents.length}</p>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="card">
          <h2>Students in {selectedCourse}</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Current Grade</th>
                <th>New Grade (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {courses.find(c => c.name === selectedCourse)?.enrolledStudents.map(email => {
                const student = users.find(u => u.email === email);
                const currentGradeObj = student?.currentCourses.find(c => c.courseName === selectedCourse);
                const currentGrade = currentGradeObj?.grade ?? 'Pending';

                return (
                  <tr key={email}>
                    <td>{email}</td>
                    <td>{student?.fullName}</td>
                    <td>{currentGrade === 'Pending' ? 'Pending' : currentGrade}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="New Grade"
                        onChange={(e) => handleGradeChange(selectedCourse, email, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={handleUpdateAll}>Update All Grades</button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;