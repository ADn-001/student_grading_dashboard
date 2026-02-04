// Simple API helper using fetch (no Axios to keep deps minimal)  
// Base URL hardcoded for local backend  
// Updated: Added createAssignment to use FormData for file uploads  
// New: Functions for student submissions, fetching submissions

// const API_BASE = 'http://localhost:5000/api';
export const BACKEND_URL = 'http://localhost:5000';  // Added: Base URL for backend, used for downloads

const API_BASE = `${BACKEND_URL}/api`;  // Updated to use BACKEND_URL
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

// Fetch assignments with optional params (teacher or courses)  
export const fetchAssignments = async (params = {}) => {  
  const url = new URL(`${API_BASE}/assignments`);  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));  
  const response = await fetch(url);  
  if (!response.ok) throw new Error('Fetch assignments failed');  
  return response.json();  
};

// Updated: Create assignment with FormData for files (no Content-Type header)  
export const createAssignment = async (data, files = []) => {  
  const formData = new FormData();  
  // Append JSON fields  
  Object.keys(data).forEach(key => formData.append(key, data[key]));  
  // Append files  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments`, {  
    method: 'POST',  
    body: formData  // Browser sets multipart/form-data  
  });  
  if (!response.ok) throw new Error('Create assignment failed');  
  return response.json();  
};

// Delete assignment  
export const deleteAssignment = async (id) => {  
  const response = await fetch(`${API_BASE}/assignments/${id}`, {  
    method: 'DELETE'  
  });  
  if (!response.ok) throw new Error('Delete assignment failed');  
  return response.json();  
};

// New: Submit student files for an assignment using FormData  
export const submitAssignment = async (assignmentId, studentId, files = []) => {  
  const formData = new FormData();  
  formData.append('student', studentId);  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {  
    method: 'POST',  
    body: formData  
  });  
  if (!response.ok) throw new Error('Submit assignment failed');  
  return response.json();  
};

// New: Fetch submissions for a specific assignment (for teachers)  
export const fetchAssignmentSubmissions = async (assignmentId) => {  
  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`);  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};

// New: Fetch submissions filtered by student (for students)  
export const fetchSubmissions = async (params = {}) => {  
  const url = new URL(`${API_BASE}/submissions`);  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));  
  const response = await fetch(url);  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};