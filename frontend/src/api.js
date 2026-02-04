// Fetch all teachers (for student dashboard)
export const fetchTeachers = async () => {
  const response = await fetch(`${API_BASE}/users?role=teacher`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Fetch teachers failed');
  return response.json();
};
// Fetch all users (admin only)
export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Fetch users failed');
  return response.json();
};
// Simple API helper using fetch (no Axios to keep deps minimal)  
// Base URL hardcoded for local backend  
// Updated: JWT token handling added; all protected routes include Authorization header
// Updated: Added fetchCurrentUser to get logged-in user after login

// const API_BASE = 'http://localhost:5000/api';
export const BACKEND_URL = 'http://localhost:5000';  // Added: Base URL for backend, used for downloads

const API_BASE = `${BACKEND_URL}/api`;  // Updated to use BACKEND_URL

/**
 * Get stored JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Helper function to add Authorization header to fetch options
 */
const getAuthHeaders = () => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Helper to get headers for FormData (no Content-Type, but includes Authorization)
 */
const getFormDataAuthHeaders = () => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Login: Return token and role
export const login = async (email, password) => {  
  const response = await fetch(`${API_BASE}/auth/login`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify({ email, password })  
  });  
  if (!response.ok) throw new Error('Login failed');  
  return response.json();  
};

// New: Fetch current user data using token
export const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
    }
    throw new Error('Fetch current user failed');
  }
  return response.json();
};


// Fetch users by email array (for teacher dashboard)
export const fetchUsersByEmails = async (emails) => {
  const response = await fetch(`${API_BASE}/users/by-emails`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails })
  });
  if (!response.ok) throw new Error('Fetch users by emails failed');
  return response.json();
};

export const fetchCourses = async () => {  
  const response = await fetch(`${API_BASE}/courses`, {
    headers: getAuthHeaders()
  });  
  if (!response.ok) throw new Error('Fetch courses failed');  
  return response.json();  
};

// New: Create a new user (POST)  
export const createUser = async (data) => {  
  const response = await fetch(`${API_BASE}/users`, {  
    method: 'POST',  
    headers: getAuthHeaders(),  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) {
    const errData = await response.json();
    const errorMsg = errData.message || errData.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || 'Create user failed';
    throw new Error(errorMsg);
  }
  return response.json();  
};

// Update: Ensure updateUser handles PUT with auth  
export const updateUser = async (id, data) => {  
  const response = await fetch(`${API_BASE}/users/${id}`, {  
    method: 'PUT',  
    headers: getAuthHeaders(),  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) throw new Error('Update user failed');  
  return response.json();  
};

// New: Delete a user (DELETE)  
export const deleteUser = async (id) => {  
  const response = await fetch(`${API_BASE}/users/${id}`, {  
    method: 'DELETE',
    headers: getAuthHeaders()  
  });  
  if (!response.ok) throw new Error('Delete user failed');  
  return response.json();  
};

export const updateCourse = async (id, data) => {  
  const response = await fetch(`${API_BASE}/courses/${id}`, {  
    method: 'PUT',  
    headers: getAuthHeaders(),  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) throw new Error('Update course failed');  
  return response.json();  
};

// Fetch assignments with optional params (teacher or courses)  
export const fetchAssignments = async (params = {}) => {  
  const url = new URL(`${API_BASE}/assignments`);  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));  
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });  
  if (!response.ok) throw new Error('Fetch assignments failed');  
  return response.json();  
};

// Updated: Create assignment with FormData for files (no Content-Type header, but include token)  
export const createAssignment = async (data, files = []) => {  
  const formData = new FormData();  
  // Append JSON fields  
  Object.keys(data).forEach(key => formData.append(key, data[key]));  
  // Append files  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments`, {  
    method: 'POST',  
    headers: getFormDataAuthHeaders(),
    body: formData  // Browser sets multipart/form-data  
  });  
  if (!response.ok) throw new Error('Create assignment failed');  
  return response.json();  
};

// Delete assignment  
export const deleteAssignment = async (id) => {  
  const response = await fetch(`${API_BASE}/assignments/${id}`, {  
    method: 'DELETE',
    headers: getAuthHeaders()  
  });  
  if (!response.ok) throw new Error('Delete assignment failed');  
  return response.json();  
};

// New: Submit student files for an assignment using FormData  
export const submitAssignment = async (assignmentId, files = []) => {  
  const formData = new FormData();  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {  
    method: 'POST',  
    headers: getFormDataAuthHeaders(),
    body: formData  
  });  
  if (!response.ok) throw new Error('Submit assignment failed');  
  return response.json();  
};

// New: Fetch submissions for a specific assignment (for teachers)  
export const fetchAssignmentSubmissions = async (assignmentId) => {  
  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {
    headers: getAuthHeaders()
  });  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};

// New: Fetch user's own submissions (for students)  
export const fetchMySubmissions = async () => {  
  const response = await fetch(`${API_BASE}/assignments/submissions/my`, {
    headers: getAuthHeaders()
  });  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};

// Download teacher file (secure endpoint)
export const downloadTeacherFile = async (assignmentId, fileName) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/assignments/downloads/teacher/${assignmentId}/${encodeURIComponent(fileName)}`, {
    headers
  });
  
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
};

// Download student submission file (secure endpoint)
export const downloadSubmissionFile = async (assignmentId, submissionId, fileName) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/assignments/downloads/student/${assignmentId}/${submissionId}/${encodeURIComponent(fileName)}`, {
    headers
  });
  
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
};