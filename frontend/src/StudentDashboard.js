// Student dashboard: Top info card, grade table card
// Fetches courses/users for teacher name/email
// Hide completed courses
// Changes: Replaced simple header with Navbar component

import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchTeachers } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);  // For name lookup

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    setStudentData(storedUser);

    const loadData = async () => {
      setCourses(await fetchCourses());
      const allTeachers = await fetchTeachers();
      setTeachers(allTeachers);
    };
    loadData();
  }, []);

  if (!studentData) return <p>Loading...</p>;

  // Get logged in user for header
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  return (
    <>
      <Sidebar />
      <Header user={loggedInUser} />
      <div className="main-content">
        <div className="card">
          <h2 style={{ textAlign: 'right', marginRight: 0 }}>{studentData.fullName}</h2>
          <p>Major: {studentData.major}</p>
          <p>Batch: {studentData.batch}</p>
          <p>Current Year/Semester: {studentData.currentYear} - {studentData.currentSemester}</p>
        </div>
        <h2 style={{ textAlign: 'right', marginRight: 0 }}>Grades</h2>
        <div className="horizontal-flex">
          {studentData.currentCourses?.map((c, idx) => {
            const course = courses.find(course => course.name === c.courseName);
            const teacherEmail = course?.teacher || 'N/A';
            const teacher = teachers.find(t => t.email === teacherEmail);
            let statusClass = 'status-not-started';
            let statusLabel = 'Not Started';
            if (c.grade) {
              statusClass = 'status-completed';
              statusLabel = 'Completed';
            } else if (course) {
              statusClass = 'status-ongoing';
              statusLabel = 'Ongoing';
            }
            return (
              <div className="card" key={idx} style={{ minWidth: 260 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.courseName}</div>
                <div style={{ color: 'var(--text-grey)', margin: '4px 0' }}>Teacher: {teacher?.fullName || 'N/A'}</div>
                <div style={{ color: 'var(--text-grey)', fontSize: '0.95rem' }}>Email: {teacherEmail}</div>
                <div className={`status-tag ${statusClass}`} style={{ margin: '8px 0' }}>{statusLabel}</div>
                <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>Grade: {c.grade || 'Pending'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;