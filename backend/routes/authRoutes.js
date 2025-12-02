// Authentication routes (simplified login only)
// No sessions or tokens - for demo only

const express = require('express');
const User = require('../models/User');

const router = express.Router();

// POST /auth/login - Check email/password and return user data
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Return user role for frontend redirection
    res.json({ role: user.role, user });
  } catch (err) {
    console.error(err);  // Basic error logging
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;