// Login component: Simple form to submit email/password
// Updated: Stores JWT token and fetches user data after login
// Changes: Added app name header, centered form, larger fields/buttons

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchCurrentUser } from './api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Get token and role from login endpoint
      const { token, role } = await login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch user data using token
      const { user } = await fetchCurrentUser();
      
      // Store user data in localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      
      // Redirect based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Check credentials or server status.');
      // Clean up on error
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-white)' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: 32 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24, marginLeft: 0 }}>UniPortal</h1>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
          <button className="button-primary" type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;