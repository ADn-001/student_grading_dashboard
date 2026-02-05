// src/components/Header.js
import React from 'react';

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="logo">UniPortal</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Hi, {user?.fullName || 'User'}</span>
        <span style={{ fontSize: 24, color: '#FFC107', cursor: 'pointer' }} role="img" aria-label="notifications">🔔</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc', display: 'inline-block' }} />
      </div>
    </header>
  );
};

export default Header;
