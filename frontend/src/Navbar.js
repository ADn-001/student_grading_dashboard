// Navbar component: Shown on all authenticated pages
// Links to Home (dashboard), Logout, Account and assignments
// Simple, effective navigation with React Router
// Changes: Converted Home and Account links into buttons for consistent UI, using navigate for routing

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('loggedInUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role;

  // Handler for logout: Clears local storage and redirects to login page
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');  // Clear user for MVP "logout"
    navigate('/');  // Redirect to login
  };

  // Handler for home navigation
  const handleHomeClick = () => {
    if (role) navigate(`/${role}/dashboard`);
  };

  // Handler for account navigation (placeholder)
  const handleAccountClick = () => {
    if (role) navigate(`/${role}/account`);
  };

  // Handler for assignments navigation
  const handleAssignmentsClick = () => {
    if (role) navigate(`/${role}/assignments`);
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0, color: 'var(--text-white)' }}>Uni-Portal</h2>
      <div>
        <button onClick={handleHomeClick} style={{ marginRight: '1rem', backgroundColor: '#333333'}}>Dashboard</button>
        {['teacher', 'student'].includes(role) && (
          <button onClick={handleAssignmentsClick} style={{ marginRight: '1rem', backgroundColor: '#333333' }}>Assignments</button>
        )}
        <button onClick={handleLogout} style={{ marginRight: '1rem', backgroundColor: '#333333'}}>Logout</button>
        {/* <button onClick={handleAccountClick}>Account</button> */}
        <Link to="/account" style={{ color: 'var(--text-white)', textDecoration: 'none' }}>Account</Link>
      </div>
    </nav>
  );
};

export default Navbar;