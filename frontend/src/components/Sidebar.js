// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// You can replace emojis with Material-UI icons if available in your project


const getMenuItems = (role) => {
  if (role === 'admin') {
    return [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/account', label: 'Account', icon: '👤' },
      { path: '/', label: 'Log Out', icon: '🚪', className: 'logout' },
    ];
  } else if (role === 'teacher') {
    return [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/teacher/assignments', label: 'Assignments', icon: '📂' },
      { path: '/account', label: 'Account', icon: '👤' },
      { path: '/', label: 'Log Out', icon: '🚪', className: 'logout' },
    ];
  } else if (role === 'student') {
    return [
      { path: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/student/assignments', label: 'Assignments', icon: '📂' },
      { path: '/account', label: 'Account', icon: '👤' },
      { path: '/', label: 'Log Out', icon: '🚪', className: 'logout' },
    ];
  }
  return [];
};


const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const role = user?.role;
  const menuItems = getMenuItems(role);
  return (
    <div className="sidebar">
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar-link ${location.pathname === item.path ? 'active' : ''} ${item.className || ''}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
