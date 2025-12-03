// Login component: Simple form to submit email/password
// Redirects based on role using React Router
// Updated: Stores logged-in user in localStorage for dashboard access (MVP temp persistence; clears on refresh)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { role, user } = await login(email, password);
      // Store user in localStorage for dashboards (JSON string)
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      // Redirect based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Check credentials or server status.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;