// Authentication routes
// Implements JWT-based authentication with password hashing
// Updated: Input validation applied

const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateLogin, sanitizeData, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// Apply sanitization to all requests
router.use(sanitizeData);

// POST /auth/login - Validate email/password and return JWT token
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches (using bcrypt comparison)
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token (valid for 1 hour)
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Return token and role (user data will be fetched separately via /api/users/me)
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;