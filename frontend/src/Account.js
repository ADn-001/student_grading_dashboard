// Account page: Displays user info based on role, allows password change
// Simple form for update, uses API to PUT own user

import React, { useState } from 'react';
import { updateUser } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Account = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('loggedInUser') || '{}'));
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword) return setError('Enter a new password');
    try {
      await updateUser(user._id, { password: newPassword });
      setNewPassword('');
      alert('Password updated');
    } catch (err) {
      setError('Update failed');
    }
  };

  return (
    <>
      <Sidebar />
      <Header user={user} />
      <div className="main-content">
        <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ marginTop: 0 }}>Account Info</h1>
          <div style={{ marginBottom: 18 }}>
            <p><b>Name:</b> {user.fullName}</p>
            <p><b>Email:</b> {user.email}</p>
            {user.role === 'student' && (
              <>
                <p><b>Major:</b> {user.major}</p>
                <p><b>Semester:</b> {user.currentSemester}</p>
                <p><b>Grad Date:</b> {user.batch}</p>
              </>
            )}
            {user.role === 'teacher' && (
              <div>
                <b>Courses Taught:</b>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {user.coursesTaught?.map((course, idx) => <li key={idx}>{course}</li>)}
                </ul>
              </div>
            )}
          </div>
          <h3 style={{ marginBottom: 8 }}>Change Password</h3>
          <form onSubmit={e => { e.preventDefault(); handleChangePassword(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" style={{ maxWidth: 300 }} />
            <button className="button-primary" type="submit" style={{ maxWidth: 180 }}>Update Password</button>
          </form>
          {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default Account;