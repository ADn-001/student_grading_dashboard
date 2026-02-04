import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherAssignments from './TeacherAssignments';
import StudentAssignments from './StudentAssignments';
import Account from './Account';
import Navbar from './Navbar'; 

const ProtectedRoute = ({ children }) => {
  // Check for both token and user data
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('loggedInUser');
  
  if (!token || !user) {
    return <Navigate to="/" />;
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />  {/* Alias for dashboard */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<TeacherAssignments />} />
      <Route path="/student/assignments" element={<StudentAssignments />} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
    </Routes>
  </Router>
);

// Redirect to role-specific dashboard
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  return <Navigate to="/" />;
};

export default App;