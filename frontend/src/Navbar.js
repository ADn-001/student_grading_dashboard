// Navbar component: Shown on all authenticated pages
// Links to Home (dashboard), Login (logout effect), Account
// Simple, effective navigation with React Router

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');  // Clear user for MVP "logout"
    navigate('/');  // Redirect to login
  };

  return (
    <nav style={{ backgroundColor: 'var(--accent-dark-red)', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
      <Link to="/home" style={{ color: 'var(--text-white)', textDecoration: 'none' }}>Home (Dashboard)</Link>
      <div>
        <button onClick={handleLogout} style={{ marginRight: '1rem' }}>Logout</button>
        <Link to="/account" style={{ color: 'var(--text-white)', textDecoration: 'none' }}>Account</Link>
      </div>
    </nav>
  );
};

export default Navbar;