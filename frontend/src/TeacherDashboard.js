
// Teacher dashboard for managing courses and student grades
// - Shows horizontal cards for each course taught by the teacher
// - Clicking a course shows a table of enrolled students and grade inputs
// - Allows batch updating of grades for all students in a course
// - All actions require teacher role (enforced by backend)

import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchUsersByEmails, updateUser } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

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
      const coursesData = await fetchCourses();
      setCourses(coursesData);
      // Get all unique student emails from courses taught by this teacher
      const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const taughtCourses = coursesData.filter(c => storedUser.coursesTaught?.includes(c.name));
      const studentEmails = Array.from(new Set(
        taughtCourses.flatMap(c => c.enrolledStudents)
      ));
      if (studentEmails.length > 0) {
        setUsers(await fetchUsersByEmails(studentEmails));
      } else {
        setUsers([]);
      }
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

  // Get logged in user for header
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  return (
    <>
      <Sidebar />
      <Header user={loggedInUser} />
      <div className="main-content">
        <h1 style={{ textAlign: 'right', marginRight: 0 }}>Teacher Dashboard</h1>
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
          <div className="card" style={{ maxWidth: 800, margin: '32px auto 0 auto', boxShadow: '0 4px 16px rgba(33,150,243,0.07)' }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>Students in {selectedCourse}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--sidebar-grey)' }}>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-grey)', fontWeight: 600, fontSize: '1rem', borderTopLeftRadius: 8 }}>Email</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-grey)', fontWeight: 600, fontSize: '1rem' }}>Name</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-grey)', fontWeight: 600, fontSize: '1rem' }}>Current Grade</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-grey)', fontWeight: 600, fontSize: '1rem', borderTopRightRadius: 8 }}>New Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.find(c => c.name === selectedCourse)?.enrolledStudents.map(email => {
                    const student = users.find(u => u.email === email);
                    const currentGradeObj = student?.currentCourses.find(c => c.courseName === selectedCourse);
                    const currentGrade = currentGradeObj?.grade ?? 'Pending';
                    return (
                      <tr key={email} style={{ background: '#fafbfc', borderBottom: '1px solid #e0e0e0', transition: 'background 0.2s' }}>
                        <td style={{ padding: '12px 10px', fontSize: '1rem', color: '#333' }}>{email}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 500 }}>{student?.fullName}</td>
                        <td style={{ padding: '12px 10px', color: currentGrade === 'Pending' ? '#f57c00' : '#2196F3', fontWeight: 500 }}>
                          {currentGrade === 'Pending' ? <span className="status-tag status-not-started">Pending</span> : <span className="status-tag status-completed">{currentGrade}</span>}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="New Grade"
                            style={{
                              width: 100,
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1.5px solid #e0e0e0',
                              fontSize: '1rem',
                              background: '#fff',
                              transition: 'border 0.2s',
                              outline: 'none',
                            }}
                            onFocus={e => (e.target.style.border = '1.5px solid #2196F3')}
                            onBlur={e => (e.target.style.border = '1.5px solid #e0e0e0')}
                            onChange={(e) => handleGradeChange(selectedCourse, email, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button className="button-primary" style={{ marginTop: 24, float: 'right', minWidth: 180 }} onClick={handleUpdateAll}>Update All Grades</button>
            <div style={{ clear: 'both' }} />
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherDashboard;