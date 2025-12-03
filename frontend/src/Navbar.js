// Navbar component: Shown on all authenticated pages
// Links to Home (dashboard), Logout, Account
// Simple, effective navigation with React Router
// Changes: Converted Home and Account links into buttons for consistent UI, using navigate for routing

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Handler for logout: Clears local storage and redirects to login page
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');  // Clear user for MVP "logout"
    navigate('/');  // Redirect to login
  };

  // Handler for home navigation
  const handleHomeClick = () => {
    navigate('/home');
  };

  // Handler for account navigation
  const handleAccountClick = () => {
    navigate('/account');
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0, color: 'var(--text-white)' }}>Student-Portal</h2>
      <div>
        <button onClick={handleHomeClick} style={{ marginRight: '1rem' }}>Dashboard</button>
        <button onClick={handleLogout} style={{ marginRight: '1rem' }}>Logout</button>
        <button onClick={handleAccountClick}>Account</button>
      </div>
    </nav>
  );
};

export default Navbar;