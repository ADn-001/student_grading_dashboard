// Student dashboard: Top info card, grade table card
// Fetches courses/users for teacher name/email
// Hide completed courses

import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchUsers } from './api';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);  // For name lookup

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    setStudentData(storedUser);

    const loadData = async () => {
      setCourses(await fetchCourses());
      const allUsers = await fetchUsers();
      setTeachers(allUsers.filter(u => u.role === 'teacher'));
    };
    loadData();
  }, []);

  if (!studentData) return <p>Loading...</p>;

  return (
    <div>
      <div className="card">
        <h2>{studentData.fullName}</h2>
        <p>Major: {studentData.major}</p>
        <p>Batch: {studentData.batch}</p>
        <p>Current Year/Semester: {studentData.currentYear} - {studentData.currentSemester}</p>
      </div>
      <div className="card">
        <h2>Grades</h2>
        <table>
          <thead>
            <tr><th>Course</th><th>Teacher</th><th>Teacher Email</th><th>Grade</th></tr>
          </thead>
          <tbody>
            {studentData.currentCourses?.map((c, idx) => {
              const course = courses.find(course => course.name === c.courseName);
              const teacherEmail = course?.teacher || 'N/A';
              const teacher = teachers.find(t => t.email === teacherEmail);
              return (
                <tr key={idx}>
                  <td>{c.courseName}</td>
                  <td>{teacher?.fullName || 'N/A'}</td>
                  <td>{teacherEmail}</td>
                  <td>{c.grade || 'Pending'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;