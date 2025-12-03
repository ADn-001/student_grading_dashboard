// frontend/src/StudentAssignments.jsx
// Student assignments page: View assignments for enrolled courses as cards (read-only)

import React, { useState, useEffect } from 'react';
import { fetchAssignments } from './api';
import Navbar from './Navbar';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments for student's current courses on mount
  useEffect(() => {
    const courses = user.currentCourses?.map(c => c.courseName) || [];
    if (courses.length > 0) {
      fetchAssignments({ courses: courses.join(',') })
        .then(setAssignments)
        .catch(console.error);
    }
  }, [user.currentCourses]);

  return (
    <div>
      <Navbar />
      <h1>Assignments</h1>
      <div className="horizontal-flex">
        {assignments.map(a => (
          <div key={a._id} className="card">
            <h3>{a.course}</h3>
            <p>{a.description}</p>
            <p>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignments;