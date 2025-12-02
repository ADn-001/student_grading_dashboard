// Simple API helper using fetch (no Axios to keep deps minimal)
// Base URL hardcoded for local backend

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
  return response.json();
};

// Add more helpers as needed, e.g., fetchCourses, updateUser, etc.
export const fetchCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`);
  return response.json();
};

export const updateUser = async (id, data) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Similar for create/delete operations