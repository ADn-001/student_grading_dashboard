// Simple API helper using fetch (no Axios to keep deps minimal)
// Base URL hardcoded for local backend
// Updated: Added createUser, updateUser (existing but ensuring), deleteUser for admin CRUD

const API_BASE = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) throw new Error('Fetch users failed');
  return response.json();
};

export const fetchCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`);
  if (!response.ok) throw new Error('Fetch courses failed');
  return response.json();
};

// New: Create a new user (POST)
export const createUser = async (data) => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Create user failed');
  return response.json();
};

// Update: Ensure updateUser handles PUT
export const updateUser = async (id, data) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Update user failed');
  return response.json();
};

// New: Delete a user (DELETE)
export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Delete user failed');
  return response.json();
};

export const updateCourse = async (id, data) => {
  const response = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Update course failed');
  return response.json();
};

