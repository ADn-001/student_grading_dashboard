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
    <div className="login-container">
      <h1>Uni-Portal</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;