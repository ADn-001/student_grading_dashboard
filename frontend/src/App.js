// Main App component: Sets up routing for login and dashboards

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
    </Routes>
  </Router>
);

export default App;