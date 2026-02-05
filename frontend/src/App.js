
// Main entry point for the React frontend
// Sets up all routes and role-based dashboard navigation
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherAssignments from './TeacherAssignments';
import StudentAssignments from './StudentAssignments';
import Account from './Account';


// Protects routes by checking for JWT token and user data in localStorage
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('loggedInUser');
  if (!token || !user) {
    // If not authenticated, redirect to login
    return <Navigate to="/" />;
  }
  return children;
};


// Main app component: sets up all routes and role-based protection
const App = () => (
  <Router>
    <Routes>
      {/* Public route: login */}
      <Route path="/" element={<Login />} />
      {/* Redirect /home to the correct dashboard based on user role */}
      <Route path="/home" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      {/* Admin dashboard (protected) */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      {/* Teacher dashboard (protected) */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
      {/* Student dashboard (protected) */}
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      {/* Teacher assignments page (protected by backend) */}
      <Route path="/teacher/assignments" element={<TeacherAssignments />} />
      {/* Student assignments page (protected by backend) */}
      <Route path="/student/assignments" element={<StudentAssignments />} />
      {/* Account page (protected) */}
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
    </Routes>
  </Router>
);


// Redirects user to their role-specific dashboard after login
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  return <Navigate to="/" />;
};

export default App;