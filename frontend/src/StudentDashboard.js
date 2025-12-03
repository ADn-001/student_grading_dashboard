// Student dashboard: View grades, history, major, etc.
// Updated: Retrieves logged-in user from localStorage instead of fetching all users and picking first
// Displays directly from user.currentCourses (personalized)

import React, { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // Retrieve logged-in user from localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setStudentData(JSON.parse(storedUser));
    } else {
      console.error('No logged-in user found');
    }
  }, []);

  if (!studentData) return <p>Loading or no user data...</p>;

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p>Major: {studentData.major || 'N/A'}</p>
      <p>Batch: {studentData.batch || 'N/A'}</p>
      <p>Current Year/Semester: {studentData.currentYear} - {studentData.currentSemester}</p>
      <h2>Current Courses</h2>
      <ul>
        {studentData.currentCourses?.map((course, idx) => (
          <li key={idx}>{course.courseName}: {course.grade || 'Pending'}</li>
        )) || <li>No courses assigned</li>}
      </ul>
      <h2>Completed Courses</h2>
      <ul>
        {studentData.completedCourses?.map((course, idx) => (
          <li key={idx}>{course.courseName} ({course.year} {course.semester}): {course.finalGrade} - {course.passed ? 'Passed' : 'Failed'}</li>
        )) || <li>No completed courses</li>}
      </ul>
    </div>
  );
};

export default StudentDashboard;