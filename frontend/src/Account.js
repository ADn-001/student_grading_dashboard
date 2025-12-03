// Account page: Displays user info based on role, allows password change
// Simple form for update, uses API to PUT own user

import React, { useState } from 'react';
import { updateUser } from './api';

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
    <div className="card">
      <h1>Account Info</h1>
      <p>Name: {user.fullName}</p>
      <p>Email: {user.email}</p>
      {user.role === 'student' && (
        <>
          <p>Major: {user.major}</p>
          <p>Semester: {user.currentSemester}</p>
          <p>Grad Date: {user.batch}</p>
        </>
      )}
      {user.role === 'teacher' && (
        <ul>
          <h3>Courses Taught:</h3>
          {user.coursesTaught?.map((course, idx) => <li key={idx}>{course}</li>)}
        </ul>
      )}
      {/* Admin: just name/email - already shown */}
      <h3>Change Password</h3>
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
      <button onClick={handleChangePassword}>Update Password</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Account;