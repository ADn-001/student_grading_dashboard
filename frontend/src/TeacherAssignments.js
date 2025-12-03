// frontend/src/TeacherAssignments.jsx
// Teacher assignments page: Form to create assignments for taught courses, cards with delete
// Fetches assignments for the current teacher

import React, { useState, useEffect } from 'react';
import { createAssignment, deleteAssignment, fetchAssignments } from './api';
import Navbar from './Navbar';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ course: '', description: '', deadline: '' });
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load teacher's assignments on mount
  useEffect(() => {
    fetchAssignments({ teacher: user._id })
      .then(setAssignments)
      .catch(console.error);
  }, [user._id]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit to create assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newAssignment = await createAssignment({ ...form, teacher: user._id });
      setAssignments([...assignments, newAssignment]);
      setForm({ course: '', description: '', deadline: '' });
    } catch (err) {
      console.error('Create assignment error:', err);
    }
  };

  // Handle delete assignment
  const handleDelete = async (id) => {
    if (window.confirm('Delete assignment?')) {
      try {
        await deleteAssignment(id);
        setAssignments(assignments.filter(a => a._id !== id));
      } catch (err) {
        console.error('Delete assignment error:', err);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Assignments</h1>
      <form onSubmit={handleSubmit}>
        <select name="course" value={form.course} onChange={handleChange} required>
          <option value="">Select Course</option>
          {user.coursesTaught?.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
        <button type="submit">Create Assignment</button>
      </form>
      <h3>Assigned work</h3>
      <div className="horizontal-flex">
        {assignments.map(a => (
          <div key={a._id} className="card">
            <h3>{a.course}</h3>
            <p>{a.description}</p>
            <p>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
            <button onClick={() => handleDelete(a._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssignments;