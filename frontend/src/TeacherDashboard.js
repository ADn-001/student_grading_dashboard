// Teacher dashboard: View courses, students, update grades
// Updated: Retrieves logged-in user from localStorage; filters courses by user.coursesTaught
// Fetches courses but only shows teacher's assigned ones; includes enrolled students per course

import React, { useEffect, useState } from 'react';
import { fetchCourses, updateUser, fetchUsers } from './api';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [courses, setCourses] = useState([]); // All courses (filtered later)
  const [gradeUpdates, setGradeUpdates] = useState({}); // Temp state for new grades per student/course

  useEffect(() => {
    // Retrieve logged-in user from localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setTeacherData(JSON.parse(storedUser));
    } else {
      console.error('No logged-in user found');
    }

    // Fetch all courses (needed for enrolled students)
    const loadCourses = async () => {
      try {
        setCourses(await fetchCourses());
      } catch (err) {
        console.error('Fetch courses error:', err);
      }
    };
    loadCourses();
  }, []);

  if (!teacherData) return <p>Loading or no user data...</p>;

  // Filter courses to those taught by this teacher
  const taughtCourses = courses.filter(course => teacherData.coursesTaught?.includes(course.name));

  // Handle grade input change (store temp per student/course)
  const handleGradeChange = (courseName, studentEmail, newGrade) => {
    setGradeUpdates(prev => ({
      ...prev,
      [`${courseName}-${studentEmail}`]: newGrade
    }));
  };

  // Update student's grade in their currentCourses
  const handleUpdateGrade = async (courseName, studentEmail, newGrade) => {
    try {
      // Fetch the student to update (need their ID; simplistic: fetch all users for MVP)
      const users = await fetchUsers(); // Assume fetchUsers imported if needed
      const student = users.find(u => u.email === studentEmail && u.role === 'student');
      if (!student) throw new Error('Student not found');

      // Update student's currentCourses array
      const updatedCourses = student.currentCourses.map(c =>
        c.courseName === courseName ? { ...c, grade: newGrade } : c
      );
      await updateUser(student._id, { currentCourses: updatedCourses });

      // Clear temp state
      setGradeUpdates(prev => ({ ...prev, [`${courseName}-${studentEmail}`]: undefined }));
      console.log(`Updated grade for ${studentEmail} in ${courseName} to ${newGrade}`);
    } catch (err) {
      console.error('Update grade error:', err);
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      {taughtCourses.map((course) => (
        <div key={course._id}>
          <h2>{course.name}</h2>
          <ul>
            {course.enrolledStudents.map((studentEmail, idx) => (
              <li key={idx}>
                {studentEmail}
                <input
                  type="text"
                  placeholder="New Grade"
                  value={gradeUpdates[`${course.name}-${studentEmail}`] || ''}
                  onChange={(e) => handleGradeChange(course.name, studentEmail, e.target.value)}
                />
                <button onClick={() => handleUpdateGrade(course.name, studentEmail, gradeUpdates[`${course.name}-${studentEmail}`])}>
                  Update
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {taughtCourses.length === 0 && <p>No courses assigned</p>}
    </div>
  );
};

export default TeacherDashboard;