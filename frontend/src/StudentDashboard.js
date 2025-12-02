// Student dashboard: View grades, history, major, etc.
// Fetches user data (assume passed or refetch via API)

import React, { useEffect, useState } from 'react';
import { fetchUsers } from './api';  // Example: fetch own data (in MVP, no auth so fetch all and filter)

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // In MVP, simplistic fetch - in real app, use user ID or token
    const loadData = async () => {
      const users = await fetchUsers();
      // Assume first student for demo; replace with proper logic
      const student = users.find(u => u.role === 'student');
      setStudentData(student);
    };
    loadData();
  }, []);

  if (!studentData) return <p>Loading...</p>;

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p>Major: {studentData.major}</p>
      <p>Batch: {studentData.batch}</p>
      <p>Current Year/Semester: {studentData.currentYear} - {studentData.currentSemester}</p>
      <h2>Current Courses</h2>
      <ul>
        {studentData.currentCourses.map((course, idx) => (
          <li key={idx}>{course.courseName}: {course.grade || 'Pending'}</li>
        ))}
      </ul>
      <h2>Completed Courses</h2>
      <ul>
        {studentData.completedCourses.map((course, idx) => (
          <li key={idx}>{course.courseName} ({course.year} {course.semester}): {course.finalGrade} - {course.passed ? 'Passed' : 'Failed'}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;