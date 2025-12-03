// backend/routes/assignmentRoutes.js
// New routes for assignments (CRUD: get, post, delete)

const express = require('express');
const Assignment = require('../models/Assignment');

const router = express.Router();

// GET /assignments - Fetch assignments with optional filters (teacher or courses comma-separated)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.teacher) filter.teacher = req.query.teacher;
  if (req.query.courses) filter.course = { $in: req.query.courses.split(',') };
  try {
    const assignments = await Assignment.find(filter).sort({ deadline: 1 });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /assignments - Create new assignment
router.post('/', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /assignments/:id - Delete assignment
router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;