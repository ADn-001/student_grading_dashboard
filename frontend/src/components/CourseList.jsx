// Reusable component example: List of courses
// Can be used in dashboards

import React from 'react';

const CourseList = ({ courses }) => (
  <ul>
    {courses.map((course, idx) => (
      <li key={idx}>{course.courseName || course.name}</li>
    ))}
  </ul>
);

export default CourseList;