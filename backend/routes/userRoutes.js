// Combined user routes for all roles (CRUD operations)
// Admin-focused; JWT authentication required on all endpoints except login
// Updated: All routes require JWT token and enforce role-based access
// Updated: Input validation applied

const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeData, handleValidationErrors, validateUserCreate } = require('../utils/validators');

const router = express.Router();

// Apply sanitization to all requests
router.use(sanitizeData);

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET /users/me - Fetch current logged-in user's data
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /users - Fetch all users (admin only) or filter by role (open to all authenticated)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    if (role) {
      // Allow any authenticated user to fetch teachers or students only
      if (!['teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      const users = await User.find({ role }).select('-password');
      return res.json(users);
    }
    // Only admin can fetch all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /users - Add new user (admin only)
router.post('/', requireRole(['admin']), validateUserCreate, handleValidationErrors, async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    // Return user without password
    const userWithoutPassword = await User.findById(newUser._id).select('-password');
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Error creating user:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0]; // Get the field that caused the duplicate key error
      return res.status(400).json({ 
        message: `A user with this ${field} already exists`,
        error: `Duplicate ${field}`
      });
    }
    
    // Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/:id - Update user
// Admin can update anyone; users can update their own profile
router.put('/:id', async (req, res) => {
  try {
    // Check authorization: admin can update anyone, user can update themselves, teacher can update their students' grades
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === req.params.id;
    let isTeacherOfStudent = false;
    if (req.user.role === 'teacher' && req.body.currentCourses) {
      // Fetch the student and check if teacher teaches any of the student's courses being updated
      const student = await User.findById(req.params.id);
      if (student && student.role === 'student') {
        // Get teacher's courses
        const teacher = await User.findById(req.user.id);
        const teacherCourses = teacher.coursesTaught || [];
        // Check if any course in update matches teacher's courses
        isTeacherOfStudent = req.body.currentCourses.some(c => teacherCourses.includes(c.courseName));
        console.log('[DEBUG] Teacher update attempt:', {
          teacherId: req.user.id,
          teacherCourses,
          studentId: req.params.id,
          updateCourses: req.body.currentCourses,
          isTeacherOfStudent
        });
      }
    }
    if (!isAdmin && !isSelf && !(req.user.role === 'teacher' && isTeacherOfStudent)) {
      console.log('[DEBUG] Forbidden update:', {
        userId: req.user.id,
        userRole: req.user.role,
        targetId: req.params.id
      });
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    // Prevent users from changing their role unless they are admin
    if (req.user.role !== 'admin' && req.body.role) {
      delete req.body.role;
    }
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `A user with this ${field} already exists`,
        error: `Duplicate ${field}`
      });
    }
    
    // Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /users/by-emails - Get users by email array (admin or teacher)
router.post('/by-emails', requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Emails array required' });
    }
    // Only return students
    const users = await User.find({ email: { $in: emails }, role: 'student' }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users by emails:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;