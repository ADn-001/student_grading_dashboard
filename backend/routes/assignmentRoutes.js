// Routes for assignments (CRUD: get, post, delete)
// Updated: JWT authentication required; role-based access control
// Updated: File validation and secure download routes added
// Updated: Input validation applied

const express = require('express');  
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require('multer');  // For handling file uploads
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeData, handleValidationErrors, validateAssignmentCreate } = require('../utils/validators');

const router = express.Router();

// Apply sanitization to all requests
router.use(sanitizeData);

// Configure multer with file validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// File filter: Allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['pdf', 'docx', 'jpg', 'png', 'zip', 'txt', 'doc'];
  const ext = file.originalname.split('.').pop().toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /assignments - Fetch assignments with optional filters
router.get('/', async (req, res) => {  
  const filter = {};  
  if (req.query.teacher) filter.teacher = req.query.teacher;  
  if (req.query.courses) filter.course = { $in: req.query.courses.split(',') };  
  try {  
    const assignments = await Assignment.find(filter).sort({ deadline: 1 });  
    res.json(assignments);  
  } catch (err) {  
    console.error('Error fetching assignments:', err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

// POST /assignments - Create new assignment (teacher only)
router.post('/', requireRole(['teacher', 'admin']), upload.array('files', 5), validateAssignmentCreate, handleValidationErrors, async (req, res) => {  
  try {  
    const assignmentData = { ...req.body };
    assignmentData.teacher = req.user.id; // Set teacher from JWT
    
    // Save uploaded file paths
    if (req.files) {  
      assignmentData.teacherFiles = req.files.map(file => file.filename);  
    }  
    
    const assignment = new Assignment(assignmentData);  
    await assignment.save();  
    res.status(201).json(assignment);  
  } catch (err) {  
    console.error('Error creating assignment:', err);  
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    }
    res.status(500).json({ message: 'Server error' });  
  }  
});

// DELETE /assignments/:id - Delete assignment (teacher or admin)
router.delete('/:id', async (req, res) => {  
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check authorization: teacher who created it or admin
    if (req.user.role !== 'admin' && assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    // Clean up teacher files
    if (assignment.teacherFiles && assignment.teacherFiles.length > 0) {
      assignment.teacherFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    }
    
    await Assignment.findByIdAndDelete(req.params.id);  
    res.json({ message: 'Assignment deleted' });  
  } catch (err) {  
    console.error('Error deleting assignment:', err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

// POST /assignments/:id/submissions - Student submits files
router.post('/:id/submissions', upload.array('files', 5), async (req, res) => {  
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Only students can submit
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }
    
    // Check if student is enrolled in the course (by email)
    const course = await Course.findOne({ name: assignment.course });
    if (!course || !course.enrolledStudents.includes(req.user.email)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if submission exists; if so, update (allow resubmit)
    let submission = await Submission.findOne({ assignment: req.params.id, student: req.user.id });  
    if (!submission) {  
      submission = new Submission({ assignment: req.params.id, student: req.user.id });  
    }  
    
    // Update files  
    if (req.files) {  
      submission.files = req.files.map(file => file.filename);  
    }  
    submission.submittedAt = Date.now();  
    await submission.save();  
    res.status(201).json(submission);  
  } catch (err) {  
    console.error('Error creating submission:', err);  
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    }
    res.status(500).json({ message: 'Server error' });  
  }  
});

// GET /assignments/:id/submissions - Fetch submissions (teacher only)
router.get('/:id/submissions', async (req, res) => {  
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Only teacher of the course can view submissions
    if (req.user.role !== 'admin' && assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const submissions = await Submission.find({ assignment: req.params.id })  
      .populate('student', 'fullName email');  
    res.json(submissions);  
  } catch (err) {  
    console.error('Error fetching submissions:', err);  
    res.status(500).json({ message: 'Server error' });  
  }  
});

// GET /assignments/submissions - Fetch user's own submissions (student)
router.get('/submissions/my', async (req, res) => {  
  try {
    // Students can only see their own submissions
    const submissions = await Submission.find({ student: req.user.id }).populate('assignment');  
    res.json(submissions);  
  } catch (err) {  
    console.error('Error fetching user submissions:', err);  
    res.status(500).json({ message: 'Server error' });  
  }
});

// GET /api/downloads/teacher/:assignmentId/:fileName - Secure download for teacher files
router.get('/downloads/teacher/:assignmentId/:fileName', async (req, res) => {
  try {
    const { assignmentId, fileName } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    console.log('Download debug:', {
      assignmentId,
      fileName,
      user: req.user,
    });
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }
    console.log('Assignment:', assignment);
    // Verify file belongs to this assignment
    if (!assignment.teacherFiles || !assignment.teacherFiles.includes(fileName)) {
      console.log('File not found in teacherFiles', assignment.teacherFiles);
      return res.status(404).json({ message: 'File not found' });
    }
    // Authorization: Teacher who created it, students enrolled in course, or admin
    let authorized = false;
    if (req.user.role === 'admin') {
      authorized = true;
    } else if (req.user.role === 'teacher' && assignment.teacher.toString() === req.user.id) {
      authorized = true;
    } else if (req.user.role === 'student') {
      const course = await Course.findOne({ name: assignment.course });
      console.log('Course:', course);
      if (course && course.enrolledStudents.includes(req.user.email)) {
        authorized = true;
      } else {
        console.log('Student not enrolled:', req.user.email, course?.enrolledStudents);
      }
    }
    if (!authorized) {
      console.log('Access denied for user', req.user);
      return res.status(403).json({ message: 'Access denied' });
    }
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    res.download(filePath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/downloads/student/:assignmentId/:submissionId/:fileName - Secure download for student submissions
router.get('/downloads/student/:assignmentId/:submissionId/:fileName', async (req, res) => {
  try {
    const { assignmentId, submissionId, fileName } = req.params;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Verify file belongs to this submission
    if (!submission.files || !submission.files.includes(fileName)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Authorization: Teacher of the course or the student who submitted
    let authorized = false;
    
    if (req.user.role === 'admin') {
      authorized = true;
    } else if (req.user.role === 'teacher' && assignment.teacher.toString() === req.user.id) {
      authorized = true;
    } else if (req.user.role === 'student' && submission.student.toString() === req.user.id) {
      authorized = true;
    }
    
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    res.download(filePath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;