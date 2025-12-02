// Teacher dashboard: View courses, students, update grades
// Simple form for updates

import React, { useEffect, useState } from 'react';
import { fetchCourses, updateUser } from './api';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      const data = await fetchCourses();
      setCourses(data);
    };
    loadCourses();
  }, []);

  const handleUpdateGrade = async (studentId, courseName, newGrade) => {
    // Simplistic: Update student's currentCourses (in real app, more robust)
    // Assume we fetch/update user directly
    await updateUser(studentId, { /* patch logic for grade */ });
    console.log(`Updated grade for ${courseName} to ${newGrade}`);
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      {courses.map((course) => (
        <div key={course._id}>
          <h2>{course.name}</h2>
          <ul>
            {course.enrolledStudents.map((student, idx) => (
              <li key={idx}>
                {student}
                {/* Simple form/button for grade update */}
                <input type="text" placeholder="New Grade" onChange={(e) => {/* store temp */}} />
                <button onClick={() => handleUpdateGrade(/* params */)}>Update</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TeacherDashboard;