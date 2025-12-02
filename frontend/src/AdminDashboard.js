// Admin dashboard: Basic CRUD for users, courses, etc.
// Uses forms for add/edit/delete

import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchCourses } from './api';
// Import updateUser, deleteUser, etc. (add to api.js if needed)

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setUsers(await fetchUsers());
      setCourses(await fetchCourses());
    };
    loadData();
  }, []);

  // Example handlers for CRUD (expand as needed)
  const handleAddUser = async (newUserData) => {
    // Use POST via api helper
    console.log('Adding user:', newUserData);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Manage Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.fullName} ({user.role})
            <button onClick={() => {/* edit */}}>Edit</button>
            <button onClick={() => {/* delete */}}>Delete</button>
          </li>
        ))}
      </ul>
      {/* Form for add */}
      <form onSubmit={handleAddUser}>
        {/* Inputs for email, password, role, etc. */}
        <button type="submit">Add User</button>
      </form>
      {/* Similar sections for courses, majors, batches */}
    </div>
  );
};

export default AdminDashboard;