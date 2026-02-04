// Course routes (CRUD and assignments)
// Updated: JWT authentication required; admin-only CRUD operations
// Updated: Input validation and sanitization applied

const express = require('express');
const Course = require('../models/Course');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeData } = require('../utils/validators');

const router = express.Router();

// Apply sanitization to all requests
router.use(sanitizeData);

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET /courses - Fetch all courses (all authenticated users)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /courses - Add new course (admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /courses/:id - Update course (admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /courses/:id - Delete course (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;