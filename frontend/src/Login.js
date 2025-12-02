// Login component: Simple form to submit email/password
// Redirects based on role using React Router (passed via props or context)
// Updated: Added error state for UI feedback on failures

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // New: State for error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');  // Clear previous errors
    try {
      const { role } = await login(email, password);
      // Redirect based on role (no persistence - refresh resets)
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);  // Keep logging
      setError('Login failed. Check credentials or server status.');  // New: Show UI error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* New: Display error */}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;