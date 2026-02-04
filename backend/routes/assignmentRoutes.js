// Routes for assignments (CRUD: get, post, delete)
// Updated: Added file upload handling with multer for teacher and student files
// New routes for submissions (student uploads) and fetching submissions

const express = require('express');  
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');  // For handling file uploads

const router = express.Router();

// Configure multer to store files in 'uploads/' and use original filename with timestamp for uniqueness
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)  // Prevent name conflicts
});
const upload = multer({ storage });

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

// POST /assignments - Create new assignment with optional teacher file uploads  
router.post('/', upload.array('files'), async (req, res) => {  
  try {  
    const assignmentData = { ...req.body };  
    // Save uploaded file paths (filenames only, as served from /uploads/)  
    if (req.files) {  
      assignmentData.teacherFiles = req.files.map(file => file.filename);  
    }  
    const assignment = new Assignment(assignmentData);  
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

// POST /assignments/:id/submissions - Student submits files for an assignment  
router.post('/:id/submissions', upload.array('files'), async (req, res) => {  
  try {  
    const { student } = req.body;  // Student ID passed from frontend (minimal auth)  
    // Check if submission exists; if so, update (allow resubmit for simplicity)  
    let submission = await Submission.findOne({ assignment: req.params.id, student });  
    if (!submission) {  
      submission = new Submission({ assignment: req.params.id, student });  
    }  
    // Update files  
    if (req.files) {  
      submission.files = req.files.map(file => file.filename);  
    }  
    submission.submittedAt = Date.now();  
    await submission.save();  
    res.status(201).json(submission);  
  } catch (err) {  
    console.error(err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

// GET /assignments/:id/submissions - Fetch all submissions for an assignment (for teachers)  
router.get('/:id/submissions', async (req, res) => {  
  try {  
    const submissions = await Submission.find({ assignment: req.params.id })  
      .populate('student', 'fullName email');  // Populate student name and email for display  
    res.json(submissions);  
  } catch (err) {  
    console.error(err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

// GET /submissions - Fetch submissions filtered by student (for students to see their own)  
router.get('/submissions', async (req, res) => {  
  const filter = {};  
  if (req.query.student) filter.student = req.query.student;  
  try {  
    const submissions = await Submission.find(filter).populate('assignment');  
    res.json(submissions);  
  } catch (err) {  
    console.error(err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

module.exports = router;  