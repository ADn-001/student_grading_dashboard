// Teacher dashboard: Horizontal course cards, clickable to show student table
// Table: email, name, current grade, new grade input
// Master Update button batches all changes

import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchUsers, updateUser } from './api';

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
    setPendingGrades(prev => ({ ...prev, [`${courseName}-${studentEmail}`]: newGrade }));
  };

  const handleUpdateAll = async () => {
    const updates = [];
    Object.entries(pendingGrades).forEach(([key, newGrade]) => {
      if (newGrade) {
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
      setPendingGrades({});  // Clear
      alert('Grades updated');
    } catch (err) {
      console.error('Batch update error:', err);
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <div className="horizontal-flex">
        {taughtCourses.map(course => (
          <div key={course._id} className="card" style={{ cursor: 'pointer', width: '200px' }} onClick={() => setSelectedCourse(selectedCourse === course.name ? null : course.name)}>
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
              <tr><th>Email</th><th>Name</th><th>Current Grade</th><th>New Grade</th></tr>
            </thead>
            <tbody>
              {courses.find(c => c.name === selectedCourse)?.enrolledStudents.map(email => {
                const student = users.find(u => u.email === email);
                const currentGrade = student?.currentCourses.find(c => c.courseName === selectedCourse)?.grade || 'Pending';
                return (
                  <tr key={email}>
                    <td>{email}</td>
                    <td>{student?.fullName}</td>
                    <td>{currentGrade}</td>
                    <td>
                      <input
                        type="text"
                        onChange={(e) => handleGradeChange(selectedCourse, email, e.target.value)}
                        placeholder="New Grade"
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