// Admin dashboard: Basic CRUD for users, courses, etc.
// Uses forms for add/edit/delete
// Updated: Added course assignment for teachers (max 3) and students (max 5)
// Conditionally shows multi-select dropdown based on role; syncs User and Course models on save
// Refetches data after mutations for UI sync; enforces max selections with checks

import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchCourses, createUser, updateUser, deleteUser, updateCourse } from './api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]); // All courses for dropdown
  const [error, setError] = useState(''); // For UI error feedback
  const [editingUser, setEditingUser] = useState(null); // Track user being edited (null for add mode)
  const [formData, setFormData] = useState({ // Form state for add/edit
    email: '',
    password: '',
    fullName: '',
    role: 'student' // Default role
  });
  const [selectedCourses, setSelectedCourses] = useState([]); // Selected course names for assignment

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setUsers(await fetchUsers());
      setCourses(await fetchCourses());
      setError(''); // Clear errors
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load data.');
    }
  };

  // Handle form input changes (text fields)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role change: Reset selected courses if role changes
  const handleRoleChange = (e) => {
    handleInputChange(e);
    setSelectedCourses([]); // Reset selections on role change
  };

  // Handle course multi-select changes
  const handleCourseChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(opt => opt.selected).map(opt => opt.value);
    const max = formData.role === 'teacher' ? 3 : 5;
    if (selected.length > max) {
      alert(`Max ${max} courses allowed for ${formData.role}s.`);
      return; // Prevent exceeding max
    }
    setSelectedCourses(selected);
  };

  // Handle add or edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedUserData = { ...formData };

      // Role-specific course assignments
      if (formData.role === 'teacher') {
        updatedUserData.coursesTaught = selectedCourses;
      } else if (formData.role === 'student') {
        updatedUserData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null })); // New assignments with null grade
      }

      let savedUser;
      if (editingUser) {
        // Edit mode: PUT update user
        savedUser = await updateUser(editingUser._id, updatedUserData);
      } else {
        // Add mode: POST create user
        savedUser = await createUser(updatedUserData);
      }

      // Sync related courses
      await syncCourses(savedUser);

      resetForm(); // Clear form
      await loadData(); // Refetch to update list
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save user.');
    }
  };

  // Sync User assignments with Course models (e.g., update teacher or enrolledStudents)
  const syncCourses = async (user) => {
    if (user.role === 'teacher') {
      // Update each selected course's teacher field
      await Promise.all(user.coursesTaught.map(async (courseName) => {
        const course = courses.find(c => c.name === courseName);
        if (course) {
          await updateCourse(course._id, { teacher: user.fullName });
        }
      }));
    } else if (user.role === 'student') {
      // Update each selected course's enrolledStudents
      await Promise.all(user.currentCourses.map(async ({ courseName }) => {
        const course = courses.find(c => c.name === courseName);
        if (course && !course.enrolledStudents.includes(user.email)) {
          await updateCourse(course._id, {
            enrolledStudents: [...course.enrolledStudents, user.email]
          });
        }
      }));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        await loadData(); // Refetch to update list
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete user.');
      }
    }
  };

  // Start editing a user (populate form and selections)
  const startEdit = (user) => {
    setFormData({
      email: user.email,
      password: user.password, // Note: Plain text for MVP - insecure!
      fullName: user.fullName,
      role: user.role
    });
    // Pre-populate selected courses based on role
    if (user.role === 'teacher') {
      setSelectedCourses(user.coursesTaught || []);
    } else if (user.role === 'student') {
      setSelectedCourses(user.currentCourses ? user.currentCourses.map(c => c.courseName) : []);
    } else {
      setSelectedCourses([]);
    }
    setEditingUser(user);
  };

  // Reset form for add mode
  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '', role: 'student' });
    setSelectedCourses([]);
    setEditingUser(null);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <h2>Manage Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.fullName} ({user.role}) - {user.email}
            <button onClick={() => startEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      {/* Form for add/edit */}
      <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
        />
        <select name="role" value={formData.role} onChange={handleRoleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        {/* Conditional course multi-select for teacher/student */}
        {(formData.role === 'teacher' || formData.role === 'student') && (
          <div>
            <label>Select Courses (hold Ctrl/Cmd for multi-select, max {formData.role === 'teacher' ? 3 : 5}):</label>
            <select multiple value={selectedCourses} onChange={handleCourseChange} size={5}>
              {courses.map((course) => (
                <option key={course._id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit">Save</button>
        {editingUser && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>
      
      {/* TODO: Similar sections for courses, majors, batches */}
    </div>
  );
};

export default AdminDashboard;