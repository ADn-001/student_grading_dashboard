# Codebase
The following sections contain the source code extracted from the main backend and frontend scripts in this project. Each section is titled with the script filename and separated by `---` for readability.
---
### server.js
// Main Express server for backend  
// Connects to MongoDB, sets up routes, listens on port 5000

const express = require('express');  
const mongoose = require('mongoose');  
const authRoutes = require('./routes/authRoutes');  
const userRoutes = require('./routes/userRoutes');  
const courseRoutes = require('./routes/courseRoutes');  
const assignmentRoutes = require('./routes/assignmentRoutes');  
const cors = require('cors');
const path = require('path');  // Added for static file serving
const multer = require('multer');  // Added for file uploads (used in routes)

const app = express();  
const PORT = 5000;

// Serve uploaded files statically for downloads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({  
  origin: 'http://localhost:3000'  // Allow frontend origin  
}));  
// Middleware for parsing JSON (minimal for MVP)  
app.use(express.json());

// Hardcoded MongoDB connection (local for demo - no .env)  
mongoose.connect('mongodb://localhost:27017/mvp_db')  
  .then(() => console.log('Connected to MongoDB'))  
  .catch(err => console.error('MongoDB connection error:', err));

// Routes  
app.use('/api/auth', authRoutes);  
app.use('/api/users', userRoutes);  
app.use('/api/courses', courseRoutes);  
app.use('/api/assignments', assignmentRoutes);

// Start server  
app.listen(PORT, () => {  
  console.log(`Backend server running on http://localhost:${PORT}`);  
});  
---
### seed.js
```javascript// seed.js - Script to seed the MongoDB database with initial data for demo purposes// Run with: node seed.js// This drops existing collections first for a clean seed (comment out if unwanted)// Uses Faker for realistic fake data// Ensures consistency between User and Course models (e.g., enrollments)// Updated: Increased students to 70 (added 20 more), and added grade seeding for student currentCourses (random grades A-F or null)
const mongoose = require('mongoose');const { faker } = require('@faker-js/faker');const User = require('./models/User');const Course = require('./models/Course');const Major = require('./models/Major');const Batch = require('./models/Batch');const Assignment = require('./models/Assignment');
// Hardcoded DB connection (as per MVP - use .env in production)const DB_URI = 'mongodb://localhost:27017/mvp_db';
// Sample data constantsconst MAJORS = ['Computer Science', 'Business Administration'];const DEPARTMENTS = ['Computer Science', 'Business'];const COURSES = [  'Math 101', 'Programming Basics', 'Data Structures', 'Economics 101',  'Marketing Principles', 'Database Systems', 'Web Development',  'Statistics', 'Business Ethics', 'Algorithms'];const DEFAULT_PASSWORD = 'password123'; // Plain text for MVP demo onlyconst STUDENT_YEAR = 1;const STUDENT_SEMESTER = 'Semester 1';const BATCH_YEAR = 2029; // Graduation year (assuming 4-year program starting 2025)const POSSIBLE_GRADES = ['A', 'B', 'C', 'D', 'F', null]; // Possible grades for seeding (including null for pending)
// Helper to generate random subset of arrayconst getRandomSubset = (arr, min = 2, max = 5) => {  const shuffled = arr.sort(() => 0.5 - Math.random());  return shuffled.slice(0, faker.number.int({ min, max }));};
// Helper to get a random gradeconst getRandomGrade = () => faker.helpers.arrayElement(POSSIBLE_GRADES);
// Main seeding functionasync function seedDB() {  try {    // Connect to DB    await mongoose.connect(DB_URI);    console.log('Connected to MongoDB');
// Drop existing collections for clean seed (optional: comment out to append)  
await Promise.all(\[  
  User.deleteMany({}),  
  Course.deleteMany({}),  
  Major.deleteMany({}),  
  Batch.deleteMany({}),  
  Assignment.deleteMany({})  
\]);  
console.log('Dropped existing collections');

// Seed Majors  
const majorDocs \= await Major.insertMany(MAJORS.map(name \=\> ({ name, description: \`Description for ${name}\` })));  
console.log('Seeded 2 majors');

// Seed Batches (one per major)  
const batchDocs \= await Batch.insertMany(MAJORS.map(major \=\> ({ graduationYear: BATCH\_YEAR, major })));  
console.log('Seeded 2 batches');

// Seed Courses (initially without teacher/students)  
const courseDocs \= await Course.insertMany(COURSES.map((name, index) \=\> ({  
  name,  
  code: \`COURSE${index \+ 1}\`,  
  major: faker.helpers.arrayElement(MAJORS), // Random major assignment  
  yearOffered: STUDENT\_YEAR,  
  semesterOffered: STUDENT\_SEMESTER,  
  teacher: '', // To be assigned later  
  enrolledStudents: \[\] // To be assigned later  
})));  
const courseNames \= courseDocs.map(c \=\> c.name); // For assignments  
console.log('Seeded 10 courses');

// Seed Admin (1)  
const admin \= new User({  
  email: 'admin@uni.com',  
  password: DEFAULT\_PASSWORD,  
  fullName: faker.person.fullName(),  
  role: 'admin',  
  permissions: \['manageUsers', 'manageCourses'\]  
});  
await admin.save();  
console.log('Seeded 1 admin');

// Seed Teachers (5)  
const teachers \= \[\];  
for (let i \= 0; i \< 5; i++) {  
  const dept \= faker.helpers.arrayElement(DEPARTMENTS);  
  const taughtCourses \= getRandomSubset(courseNames, 2, 3); // 2-3 courses per teacher  
  const teacher \= new User({  
    email: faker.internet.email(),  
    password: DEFAULT\_PASSWORD,  
    fullName: faker.person.fullName(),  
    role: 'teacher',  
    department: dept,  
    coursesTaught: taughtCourses  
  });  
  await teacher.save();  
  teachers.push(teacher);

  // Assign teacher to their courses (update Course docs)  
    await Promise.all(taughtCourses.map(async courseName \=\> {  
    await Course.findOneAndUpdate({ name: courseName }, { teacher: teacher.email });  // Change to email  
    }));  
}  
console.log('Seeded 5 teachers and assigned courses');

// Seed Students (70, spread between majors: 35 per major)  
const studentsPerMajor \= 35; // Increased from 25 to 35 (adds 20 total students)  
for (const major of MAJORS) {  
  for (let i \= 0; i \< studentsPerMajor; i++) {  
    const batch \= batchDocs.find(b \=\> b.major \=== major).graduationYear.toString();  
    const currentCourses \= getRandomSubset(courseNames, 3, 5).map(name \=\> ({  
      courseName: name,  
      grade: getRandomGrade() // Seed random grade (A-F or null)  
    })); // 3-5 random courses, with seeded grades  
    const student \= new User({  
      email: faker.internet.email(),  
      password: DEFAULT\_PASSWORD,  
      fullName: faker.person.fullName(),  
      role: 'student',  
      major,  
      batch,  
      currentYear: STUDENT\_YEAR,  
      currentSemester: STUDENT\_SEMESTER,  
      currentCourses,  
      completedCourses: \[\] // None for 1st year  
    });  
    await student.save();

    // Enroll student in their courses (update Course docs)  
    await Promise.all(currentCourses.map(async ({ courseName }) \=\> {  
      await Course.findOneAndUpdate(  
        { name: courseName },  
        { $push: { enrolledStudents: student.email } }  
      );  
    }));  
  }  
}  
console.log('Seeded 70 students, assigned majors/batches/courses, and seeded grades');

  } catch (err) {    console.error('Seeding error:', err);  } finally {    // Disconnect and exit    await mongoose.disconnect();    console.log('Disconnected from MongoDB');    process.exit(0);  }}
// Run the seederseedDB();```
---
### models/Batch.js
```javascript// Simple Batch model
const mongoose = require('mongoose');
const batchSchema = new mongoose.Schema({  graduationYear: { type: Number, required: true },  major: { type: String }});
module.exports = mongoose.model('Batch', batchSchema);```
---
### models/Submisson.js
---
// Model for student submissions to assignments
// Stores uploaded files from students for a specific assignment

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({  
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },  
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  files: [{ type: String }],  // Array of file paths (e.g., 'filename.pdf') for student uploads  
  submittedAt: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('Submission', submissionSchema);  
---
### models/User.js
```javascript// User model schema for all roles (student, teacher, admin)// Embeds role-specific data for simplicity in MVP
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({  email: { type: String, required: true, unique: true },  password: { type: String, required: true },  // Plain text for demo only - NEVER use in production  fullName: { type: String, required: true },  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },  
  // Student-specific fields (ignored if not student)  major: { type: String },  batch: { type: String },  currentYear: { type: Number },  currentSemester: { type: String },  currentCourses: [{    courseName: { type: String },    grade: { type: String }  // e.g., 'A' or null  }],  completedCourses: [{    courseName: { type: String },    year: { type: Number },    semester: { type: String },    finalGrade: { type: String },    passed: { type: Boolean }  }],  
  // Teacher-specific fields (ignored if not teacher)  department: { type: String },  coursesTaught: [{ type: String }],  // Course names  
  // Admin-specific fields (ignored if not admin)  permissions: [{ type: String }]  // e.g., ['manageUsers']});
module.exports = mongoose.model('User', userSchema);```
---
### models/Major.js
```javascript// Simple Major model
const mongoose = require('mongoose');
const majorSchema = new mongoose.Schema({  name: { type: String, required: true },  description: { type: String }});
module.exports = mongoose.model('Major', majorSchema);```
---
### models/Assignment.js
```javascript// New model for assignments
// Model for assignments

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({  
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  course: { type: String, required: true },  
  description: { type: String, required: true },  
  deadline: { type: Date, required: true },  
  teacherFiles: [{ type: String }]  // Added: Array of file paths for teacher uploads (e.g., assignment materials)  
});

module.exports = mongoose.model('Assignment', assignmentSchema);  ```
---
### models/Course.js
```javascript// Course model schema with embedded enrollments for simplicity
const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({  name: { type: String, required: true },  code: { type: String, required: true },  teacher: { type: String },  // Teacher fullName or email  major: { type: String },  yearOffered: { type: Number },  semesterOffered: { type: String },  enrolledStudents: [{ type: String }]  // Student emails or names});
module.exports = mongoose.model('Course', courseSchema);```
---
### routes/courseRoutes.js
```javascript// Course routes (CRUD and assignments)
const express = require('express');const Course = require('../models/Course');
const router = express.Router();
// GET /courses - Fetch all coursesrouter.get('/', async (req, res) => {  try {    const courses = await Course.find();    res.json(courses);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// POST /courses - Add new courserouter.post('/', async (req, res) => {  try {    const newCourse = new Course(req.body);    await newCourse.save();    res.status(201).json(newCourse);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// PUT /courses/:id - Update course (e.g., assign teacher/students)router.put('/:id', async (req, res) => {  try {    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });    res.json(updatedCourse);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// DELETE /courses/:id - Delete courserouter.delete('/:id', async (req, res) => {  try {    await Course.findByIdAndDelete(req.params.id);    res.json({ message: 'Course deleted' });  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
module.exports = router;```
---
### routes/userRoutes.js
```javascript// Combined user routes for all roles (CRUD operations)// Admin-focused, but accessible based on role (no auth checks in MVP)
const express = require('express');const User = require('../models/User');
const router = express.Router();
// GET /users - Fetch all users (for admin)router.get('/', async (req, res) => {  try {    const users = await User.find();    res.json(users);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// POST /users - Add new user (for admin)router.post('/', async (req, res) => {  try {    const newUser = new User(req.body);    await newUser.save();    res.status(201).json(newUser);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// PUT /users/:id - Update user (for admin/teacher/student self-update)router.put('/:id', async (req, res) => {  try {    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });    res.json(updatedUser);  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// DELETE /users/:id - Delete user (for admin)router.delete('/:id', async (req, res) => {  try {    await User.findByIdAndDelete(req.params.id);    res.json({ message: 'User deleted' });  } catch (err) {    console.error(err);    res.status(500).json({ message: 'Server error' });  }});
// Additional routes can be added for role-specific updates (e.g., update grades)
module.exports = router;```
---
### routes/authRoutes.js
```javascript// Authentication routes (simplified login only)// No sessions or tokens - for demo only
const express = require('express');const User = require('../models/User');
const router = express.Router();
// POST /auth/login - Check email/password and return user datarouter.post('/login', async (req, res) => {  const { email, password } = req.body;  try {    const user = await User.findOne({ email });    if (!user || user.password !== password) {      return res.status(401).json({ message: 'Invalid credentials' });    }    // Return user role for frontend redirection    res.json({ role: user.role, user });  } catch (err) {    console.error(err);  // Basic error logging    res.status(500).json({ message: 'Server error' });  }});
module.exports = router;```
---
### routes/assignmentRoutes.js
```// Routes for assignments (CRUD: get, post, delete)
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

module.exports = router;```
---
## Frontend (src)
---
### App.js
```javascriptimport React from 'react';import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';import Login from './Login';import AdminDashboard from './AdminDashboard';import TeacherDashboard from './TeacherDashboard';import StudentDashboard from './StudentDashboard';import TeacherAssignments from './TeacherAssignments';import StudentAssignments from './StudentAssignments';import Account from './Account';import Navbar from './Navbar'; 
const ProtectedRoute = ({ children }) => {  const user = localStorage.getItem('loggedInUser');  if (!user) return <Navigate to="/" />;  return (    <>      <Navbar />      {children}    </>  );};
const App = () => (  <Router>    <Routes>      <Route path="/" element={<Login />} />      <Route path="/home" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />  {/* Alias for dashboard */}      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />      <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />      <Route path="/teacher/assignments" element={<TeacherAssignments />} />      <Route path="/student/assignments" element={<StudentAssignments />} />      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />    </Routes>  </Router>);
// Redirect to role-specific dashboardconst DashboardRedirect = () => {  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;  if (user.role === 'student') return <Navigate to="/student/dashboard" />;  return <Navigate to="/" />;};
export default App;```
---
### AdminDashboard.js
```javascript// Admin dashboard: 3 separate tables for user types, dedicated add forms per role, search-based edit form// Updated for UI enhancements: Tables for admins/teachers/students, role-specific add forms (student includes major/batch/year/sem)// Course assignments for teacher/student adds/edits, with max limits// Syncs User and Course models on save; uses separate states for each add form// Clean structure: Handlers reused where possible, good comments for readability// Changes: Replaced simple header with Navbar component
import React, { useEffect, useState } from 'react';import { fetchUsers, fetchCourses, createUser, updateUser, deleteUser, updateCourse } from './api';import Navbar from './Navbar';
const AdminDashboard = () => {  const [users, setUsers] = useState([]);  const [courses, setCourses] = useState([]);  const [error, setError] = useState('');  const [searchEmail, setSearchEmail] = useState('');  const [editingUser, setEditingUser] = useState(null);  const [selectedCourses, setSelectedCourses] = useState([]); // For edit course selections  const [showEditDropdown, setShowEditDropdown] = useState(false); // Toggle for edit dropdown
  // Dedicated form states  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '', role: 'admin' });  const [teacherForm, setTeacherForm] = useState({ email: '', password: '', fullName: '', role: 'teacher' });  const [teacherCourses, setTeacherCourses] = useState([]); // Separate for teacher add  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false); // Toggle for teacher add dropdown  const [studentForm, setStudentForm] = useState({    email: '', password: '', fullName: '', role: 'student',    major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1'  });  const [studentCourses, setStudentCourses] = useState([]); // Separate for student add  const [showStudentDropdown, setShowStudentDropdown] = useState(false); // Toggle for student add dropdown
  // Define loadData here (simple async function to fetch data; called in useEffect and handlers)  const loadData = async () => {    try {      setUsers(await fetchUsers());      setCourses(await fetchCourses());      setError('');    } catch (err) {      console.error('Load data error:', err);      setError('Failed to load data.');    }  };
  // Load data on mount  useEffect(() => {    loadData();  }, []);
  // Generic input change handler (for any form)  const handleInputChange = (e, setForm) => {    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));  };
  // Course checkbox handler (with max check)  const handleCourseCheckbox = (courseName, role, selected, setSelected) => {    const max = role === 'teacher' ? 3 : 5;    let newSelected = [...selected];    if (newSelected.includes(courseName)) {      newSelected = newSelected.filter(c => c !== courseName);    } else if (newSelected.length < max) {      newSelected.push(courseName);    } else {      alert(`Max ${max} courses allowed for ${role}s.`);      return;    }    setSelected(newSelected);  };
  // Generic add handler (role-specific)  const handleAdd = async (formData, selectedCourses = [], role) => {    try {      let updatedData = { ...formData };      if (role === 'teacher') updatedData.coursesTaught = selectedCourses;      if (role === 'student') updatedData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null }));      const savedUser = await createUser(updatedData);      await syncCourses(savedUser); // Sync with courses      // Reset forms and toggles      if (role === 'admin') setAdminForm({ email: '', password: '', fullName: '', role: 'admin' });      if (role === 'teacher') { setTeacherForm({ email: '', password: '', fullName: '', role: 'teacher' }); setTeacherCourses([]); setShowTeacherDropdown(false); }      if (role === 'student') { setStudentForm({ email: '', password: '', fullName: '', role: 'student', major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1' }); setStudentCourses([]); setShowStudentDropdown(false); }      await loadData(); // Refetch    } catch (err) {      console.error('Add error:', err);      setError('Failed to add user.');    }  };
  // Handle delete  const handleDelete = async (id) => {    if (window.confirm('Delete user?')) {      try {        await deleteUser(id);        await loadData();      } catch (err) {        console.error('Delete error:', err);        setError('Failed to delete.');      }    }  };
  // Search for edit  const handleSearch = async () => {    const user = users.find(u => u.email === searchEmail);    if (user) {      setEditingUser(user);      // Pre-populate courses for edit      if (user.role === 'teacher') setSelectedCourses(user.coursesTaught || []);      if (user.role === 'student') setSelectedCourses(user.currentCourses ? user.currentCourses.map(c => c.courseName) : []);      setShowEditDropdown(false);    } else {      setError('User not found');    }  };
  // Handle edit submit  const handleEditSubmit = async (e) => {    e.preventDefault();    try {      let updatedData = { ...editingUser };      if (editingUser.role === 'teacher') updatedData.coursesTaught = selectedCourses;      if (editingUser.role === 'student') updatedData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null })); // Reset grades for simplicity      const savedUser = await updateUser(editingUser._id, updatedData);      await syncCourses(savedUser);      setEditingUser(null);      setSelectedCourses([]);      setSearchEmail('');      setShowEditDropdown(false);      await loadData();    } catch (err) {      console.error('Edit error:', err);      setError('Failed to edit user.');    }  };
  // Sync assignments with Course models (shared function)  const syncCourses = async (user) => {    if (user.role === 'teacher') {      await Promise.all(user.coursesTaught.map(async (name) => {        const course = courses.find(c => c.name === name);        if (course) await updateCourse(course._id, { teacher: user.email }); // Use email as per seed update      }));    } else if (user.role === 'student') {      await Promise.all(user.currentCourses.map(async ({ courseName }) => {        const course = courses.find(c => c.name === courseName);        if (course && !course.enrolledStudents.includes(user.email)) {          await updateCourse(course._id, { enrolledStudents: [...course.enrolledStudents, user.email] });        }      }));    }  };
  // Filter users by role for tables  const admins = users.filter(u => u.role === 'admin');  const teachers = users.filter(u => u.role === 'teacher');  const students = users.filter(u => u.role === 'student');
  return (    <div>      <h1>Admin Dashboard</h1>      {error && <p style={{ color: 'red' }}>{error}</p>}
  {/\* Admins Table \*/}  
  \<h2\>Admins\</h2\>  
  \<table\>  
    \<thead\>\<tr\>\<th\>Name\</th\>\<th\>Email\</th\>\<th\>Actions\</th\>\</tr\>\</thead\>  
    \<tbody\>  
      {admins.map(u \=\> (  
        \<tr key={u.\_id}\>  
          \<td\>{u.fullName}\</td\>\<td\>{u.email}\</td\>  
          \<td\>\<button onClick={() \=\> handleDelete(u.\_id)}\>Delete\</button\>\</td\>  
        \</tr\>  
      ))}  
    \</tbody\>  
  \</table\>

  {/\* Teachers Table \*/}  
  \<h2\>Teachers\</h2\>  
  \<table\>  
    \<thead\>\<tr\>\<th\>Name\</th\>\<th\>Email\</th\>\<th\>Courses\</th\>\<th\>Actions\</th\>\</tr\>\</thead\>  
    \<tbody\>  
      {teachers.map(u \=\> (  
        \<tr key={u.\_id}\>  
          \<td\>{u.fullName}\</td\>\<td\>{u.email}\</td\>\<td\>{u.coursesTaught?.join(', ') || 'None'}\</td\>  
          \<td\>\<button onClick={() \=\> handleDelete(u.\_id)}\>Delete\</button\>\</td\>  
        \</tr\>  
      ))}  
    \</tbody\>  
  \</table\>

  {/\* Students Table \*/}  
  \<h2\>Students\</h2\>  
  \<table\>  
    \<thead\>\<tr\>\<th\>Name\</th\>\<th\>Email\</th\>\<th\>Major\</th\>\<th\>Batch\</th\>\<th\>Courses\</th\>\<th\>Actions\</th\>\</tr\>\</thead\>  
    \<tbody\>  
      {students.map(u \=\> (  
        \<tr key={u.\_id}\>  
          \<td\>{u.fullName}\</td\>\<td\>{u.email}\</td\>\<td\>{u.major}\</td\>\<td\>{u.batch}\</td\>  
          \<td\>{u.currentCourses?.map(c \=\> c.courseName).join(', ') || 'None'}\</td\>  
          \<td\>\<button onClick={() \=\> handleDelete(u.\_id)}\>Delete\</button\>\</td\>  
        \</tr\>  
      ))}  
    \</tbody\>  
  \</table\>

  {/\* Add Admin Form \*/}  
  \<h2\>Add Admin\</h2\>  
  \<form onSubmit={(e) \=\> { e.preventDefault(); handleAdd(adminForm, \[\], 'admin'); }}\>  
    \<input name="fullName" value={adminForm.fullName} onChange={(e) \=\> handleInputChange(e, setAdminForm)} placeholder="Full Name" required /\>  
    \<input name="email" value={adminForm.email} onChange={(e) \=\> handleInputChange(e, setAdminForm)} placeholder="Email" required /\>  
    \<input name="password" type="password" value={adminForm.password} onChange={(e) \=\> handleInputChange(e, setAdminForm)} placeholder="Password" required /\>  
    \<button type="submit"\>Add Admin\</button\>  
  \</form\>

  {/\* Add Teacher Form \*/}  
  \<h2\>Add Teacher\</h2\>  
  \<form onSubmit={(e) \=\> { e.preventDefault(); handleAdd(teacherForm, teacherCourses, 'teacher'); }}\>  
    \<input name="fullName" value={teacherForm.fullName} onChange={(e) \=\> handleInputChange(e, setTeacherForm)} placeholder="Full Name" required /\>  
    \<input name="email" value={teacherForm.email} onChange={(e) \=\> handleInputChange(e, setTeacherForm)} placeholder="Email" required /\>  
    \<input name="password" type="password" value={teacherForm.password} onChange={(e) \=\> handleInputChange(e, setTeacherForm)} placeholder="Password" required /\>  
    \<button type="button" onClick={() \=\> setShowTeacherDropdown(\!showTeacherDropdown)}\>Assign Courses\</button\>  
    {showTeacherDropdown && (  
      \<div className="dropdown"\>  
        {courses.map(c \=\> (  
          \<label key={c.\_id}\>  
            \<input  
              type="checkbox"  
              checked={teacherCourses.includes(c.name)}  
              onChange={() \=\> handleCourseCheckbox(c.name, 'teacher', teacherCourses, setTeacherCourses)}  
            /\>  
            {c.name}  
          \</label\>  
        ))}  
      \</div\>  
    )}  
    \<button type="submit"\>Add Teacher\</button\>  
  \</form\>

  {/\* Add Student Form \*/}  
  \<h2\>Add Student\</h2\>  
  \<form onSubmit={(e) \=\> { e.preventDefault(); handleAdd(studentForm, studentCourses, 'student'); }}\>  
    \<input name="fullName" value={studentForm.fullName} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Full Name" required /\>  
    \<input name="email" value={studentForm.email} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Email" required /\>  
    \<input name="password" type="password" value={studentForm.password} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Password" required /\>  
    \<input name="major" value={studentForm.major} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Major" required /\>  
    \<input name="batch" value={studentForm.batch} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Batch (e.g., 2025)" required /\>  
    \<input name="currentYear" type="number" value={studentForm.currentYear} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Current Year" required /\>  
    \<input name="currentSemester" value={studentForm.currentSemester} onChange={(e) \=\> handleInputChange(e, setStudentForm)} placeholder="Current Semester" required /\>  
    \<button type="button" onClick={() \=\> setShowStudentDropdown(\!showStudentDropdown)}\>Assign Courses\</button\>  
    {showStudentDropdown && (  
      \<div className="dropdown"\>  
        {courses.map(c \=\> (  
          \<label key={c.\_id}\>  
            \<input  
              type="checkbox"  
              checked={studentCourses.includes(c.name)}  
              onChange={() \=\> handleCourseCheckbox(c.name, 'student', studentCourses, setStudentCourses)}  
            /\>  
            {c.name}  
          \</label\>  
        ))}  
      \</div\>  
    )}  
    \<button type="submit"\>Add Student\</button\>  
  \</form\>

  {/\* Edit User Form \*/}  
  \<h2\>Edit User (Search by Email)\</h2\>  
  \<input value={searchEmail} onChange={(e) \=\> setSearchEmail(e.target.value)} placeholder="Email" /\>  
  \<button onClick={handleSearch}\>Search\</button\>  
  {editingUser && (  
    \<form onSubmit={handleEditSubmit}\>  
      \<input name="fullName" value={editingUser.fullName} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" required /\>  
      \<input name="email" value={editingUser.email} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, email: e.target.value }))} placeholder="Email" required /\>  
      \<input name="password" type="password" value={editingUser.password} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, password: e.target.value }))} placeholder="Password" required /\>  
      {editingUser.role \=== 'student' && (  
        \<\>  
          \<input name="major" value={editingUser.major || ''} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, major: e.target.value }))} placeholder="Major" /\>  
          \<input name="batch" value={editingUser.batch || ''} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, batch: e.target.value }))} placeholder="Batch" /\>  
          \<input name="currentYear" type="number" value={editingUser.currentYear || 1} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, currentYear: parseInt(e.target.value) }))} placeholder="Current Year" /\>  
          \<input name="currentSemester" value={editingUser.currentSemester || ''} onChange={(e) \=\> setEditingUser(prev \=\> ({ ...prev, currentSemester: e.target.value }))} placeholder="Current Semester" /\>  
        \</\>  
      )}  
      {(editingUser.role \=== 'teacher' || editingUser.role \=== 'student') && (  
        \<\>  
          \<button type="button" onClick={() \=\> setShowEditDropdown(\!showEditDropdown)}\>Assign Courses\</button\>  
          {showEditDropdown && (  
            \<div className="dropdown"\>  
              {courses.map(c \=\> (  
                \<label key={c.\_id}\>  
                  \<input  
                    type="checkbox"  
                    checked={selectedCourses.includes(c.name)}  
                    onChange={() \=\> handleCourseCheckbox(c.name, editingUser.role, selectedCourses, setSelectedCourses)}  
                  /\>  
                  {c.name}  
                \</label\>  
              ))}  
            \</div\>  
          )}  
        \</\>  
      )}  
      \<button type="submit"\>Save Edit\</button\>  
      \<button type="button" onClick={() \=\> setEditingUser(null)}\>Cancel\</button\>  
    \</form\>  
  )}  
\</div\>  

  );};
export default AdminDashboard;```
---
### Navbar.js
```javascript// Navbar component: Shown on all authenticated pages// Links to Home (dashboard), Logout, Account and assignments// Simple, effective navigation with React Router// Changes: Converted Home and Account links into buttons for consistent UI, using navigate for routing
import React from 'react';import { Link, useNavigate } from 'react-router-dom';
const Navbar = () => {  const navigate = useNavigate();  const storedUser = localStorage.getItem('loggedInUser');  const user = storedUser ? JSON.parse(storedUser) : null;  const role = user?.role;
  // Handler for logout: Clears local storage and redirects to login page  const handleLogout = () => {    localStorage.removeItem('loggedInUser');  // Clear user for MVP "logout"    navigate('/');  // Redirect to login  };
  // Handler for home navigation  const handleHomeClick = () => {    if (role) navigate(`/${role}/dashboard`);  };
  // Handler for account navigation (placeholder)  const handleAccountClick = () => {    if (role) navigate(`/${role}/account`);  };
  // Handler for assignments navigation  const handleAssignmentsClick = () => {    if (role) navigate(`/${role}/assignments`);  };
  return (    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>      <h2 style={{ margin: 0, color: 'var(--text-white)' }}>Uni-Portal</h2>      <div>        <button onClick={handleHomeClick} style={{ marginRight: '1rem', backgroundColor: '#333333'}}>Dashboard</button>        {['teacher', 'student'].includes(role) && (          <button onClick={handleAssignmentsClick} style={{ marginRight: '1rem', backgroundColor: '#333333' }}>Assignments</button>        )}        <button onClick={handleLogout} style={{ marginRight: '1rem', backgroundColor: '#333333'}}>Logout</button>        {/* <button onClick={handleAccountClick}>Account</button> */}        <Link to="/account" style={{ color: 'var(--text-white)', textDecoration: 'none' }}>Account</Link>      </div>    </nav>  );};
export default Navbar;```
---
### StudentDashboard.js
```javascript// Student dashboard: Top info card, grade table card// Fetches courses/users for teacher name/email// Hide completed courses// Changes: Replaced simple header with Navbar component
import React, { useEffect, useState } from 'react';import { fetchCourses, fetchUsers } from './api';import Navbar from './Navbar';
const StudentDashboard = () => {  const [studentData, setStudentData] = useState(null);  const [courses, setCourses] = useState([]);  const [teachers, setTeachers] = useState([]);  // For name lookup
  useEffect(() => {    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');    setStudentData(storedUser);
const loadData \= async () \=\> {  
  setCourses(await fetchCourses());  
  const allUsers \= await fetchUsers();  
  setTeachers(allUsers.filter(u \=\> u.role \=== 'teacher'));  
};  
loadData();  

  }, []);
  if (!studentData) return <p>Loading...</p>;
  return (    <div>      <div className="card">        <h2>{studentData.fullName}</h2>        <p>Major: {studentData.major}</p>        <p>Batch: {studentData.batch}</p>        <p>Current Year/Semester: {studentData.currentYear} - {studentData.currentSemester}</p>      </div>      <div className="card">        <h2>Grades</h2>        <table>          <thead>            <tr><th>Course</th><th>Teacher</th><th>Teacher Email</th><th>Grade</th></tr>          </thead>          <tbody>            {studentData.currentCourses?.map((c, idx) => {              const course = courses.find(course => course.name === c.courseName);              const teacherEmail = course?.teacher || 'N/A';              const teacher = teachers.find(t => t.email === teacherEmail);              return (                <tr key={idx}>                  <td>{c.courseName}</td>                  <td>{teacher?.fullName || 'N/A'}</td>                  <td>{teacherEmail}</td>                  <td>{c.grade || 'Pending'}</td>                </tr>              );            })}          </tbody>        </table>      </div>    </div>  );};
export default StudentDashboard;```
---
### components/CourseList.jsx
```jsx// Reusable component example: List of courses// Can be used in dashboards
import React from 'react';
const CourseList = ({ courses }) => (  <ul>    {courses.map((course, idx) => (      <li key={idx}>{course.courseName || course.name}</li>    ))}  </ul>);
export default CourseList;```
---
### TeacherAssignments.js
```// Teacher assignments page: Create assignments with file uploads, view/delete, view student submissions
// Updated: Added file upload during creation (teacher materials)
// New: Display teacher file download links; button to view student submissions with download links
// Fix: Use BACKEND_URL for download links to point to backend server

import React, { useState, useEffect } from 'react';  
import { fetchAssignments, createAssignment, deleteAssignment, fetchAssignmentSubmissions, BACKEND_URL } from './api';  // Updated: Import BACKEND_URL
import Navbar from './Navbar';

const TeacherAssignments = () => {  
  const [assignments, setAssignments] = useState([]);  
  const [form, setForm] = useState({ course: '', description: '', deadline: '' });  
  const [files, setFiles] = useState([]);  // Added: For teacher file uploads  
  const [selectedAssignment, setSelectedAssignment] = useState(null);  // For viewing submissions  
  const [submissions, setSubmissions] = useState([]);  // Student submissions for selected assignment  
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments for teacher on mount  
  useEffect(() => {  
    fetchAssignments({ teacher: user._id })  
      .then(setAssignments)  
      .catch(console.error);  
  }, []);

  // Handle text input changes  
  const handleChange = (e) => {  
    setForm({ ...form, [e.target.name]: e.target.value });  
  };

  // Handle file input changes (multiple files)  
  const handleFileChange = (e) => {  
    setFiles(Array.from(e.target.files));  // Convert FileList to array  
  };

  // Handle form submit to create assignment with files  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    try {  
      const newAssignment = await createAssignment({ ...form, teacher: user._id }, files);  
      setAssignments([...assignments, newAssignment]);  
      setForm({ course: '', description: '', deadline: '' });  
      setFiles([]);  // Clear files  
    } catch (err) {  
      console.error('Create assignment error:', err);  
    }  
  };

  // Handle delete assignment  
  const handleDelete = async (id) => {  
    if (window.confirm('Delete assignment?')) {  
      try {  
        await deleteAssignment(id);  
        setAssignments(assignments.filter(a => a._id !== id));  
      } catch (err) {  
        console.error('Delete assignment error:', err);  
      }  
    }  
  };

  // Handle viewing submissions for an assignment  
  const handleViewSubmissions = async (id) => {  
    if (selectedAssignment === id) {  
      setSelectedAssignment(null);  // Toggle off  
      setSubmissions([]);  
    } else {  
      try {  
        const subs = await fetchAssignmentSubmissions(id);  
        setSubmissions(subs);  
        setSelectedAssignment(id);  
      } catch (err) {  
        console.error('Fetch submissions error:', err);  
      }  
    }  
  };

  return (  
    <div>  
      <Navbar />  
      <h1>Assignments</h1>  
      <form onSubmit={handleSubmit}>  
        <select name="course" value={form.course} onChange={handleChange} required>  
          <option value="">Select Course</option>  
          {user.coursesTaught?.map(c => (  
            <option key={c} value={c}>{c}</option>  
          ))}  
        </select>  
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />  
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />  
        <input type="file" multiple onChange={handleFileChange} />  {/* Added: File upload input */}  
        <button type="submit">Create Assignment</button>  
      </form>  
      <h3>Assigned work</h3>  
      <div className="horizontal-flex">  
        {assignments.map(a => (  
          <div key={a._id} className="card">  
            <h3>{a.course}</h3>  
            <p>{a.description}</p>  
            <p>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>  
            {/* Display teacher uploaded files as download links */}  
            {a.teacherFiles?.length > 0 && (  
              <>  
                <h4>Materials:</h4>  
                <ul>  
                  {a.teacherFiles.map((file, idx) => (  
                    <li key={idx}>  
                      <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                    </li>  
                  ))}  
                </ul>  
              </>  
            )}  
            <button onClick={() => handleDelete(a._id)}>Delete</button>  
            <button onClick={() => handleViewSubmissions(a._id)}>View Submissions</button>  
            {/* Show submissions if selected */}  
            {selectedAssignment === a._id && (  
              <div>  
                <h4>Student Submissions:</h4>  
                {submissions.length === 0 ? <p>No submissions yet.</p> : (  
                  submissions.map(sub => (  
                    <div key={sub._id} className="card" style={{ marginTop: '1rem' }}>  
                      <p>Student: {sub.student.fullName} ({sub.student.email})</p>  
                      <p>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>  
                      <ul>  
                        {sub.files.map((file, idx) => (  
                          <li key={idx}>  
                            <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                          </li>  
                        ))}  
                      </ul>  
                    </div>  
                  ))  
                )}  
              </div>  
            )}  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
};

export default TeacherAssignments;```
---
### index.js
```javascriptimport React from 'react';import ReactDOM from 'react-dom/client';import './index.css';import App from './App';import reportWebVitals from './reportWebVitals';import './App.css';  // Global styles
const root = ReactDOM.createRoot(document.getElementById('root'));root.render(  <React.StrictMode>    <App />  </React.StrictMode>);
// If you want to start measuring performance in your app, pass a function// to log results (for example: reportWebVitals(console.log))// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitalsreportWebVitals();```
---
### api.js
```// Simple API helper using fetch (no Axios to keep deps minimal)  
// Base URL hardcoded for local backend  
// Updated: Added createAssignment to use FormData for file uploads  
// New: Functions for student submissions, fetching submissions

// const API_BASE = 'http://localhost:5000/api';
export const BACKEND_URL = 'http://localhost:5000';  // Added: Base URL for backend, used for downloads

const API_BASE = `${BACKEND_URL}/api`;  // Updated to use BACKEND_URL
export const login = async (email, password) => {  
  const response = await fetch(`${API_BASE}/auth/login`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify({ email, password })  
  });  
  if (!response.ok) throw new Error('Login failed');  
  return response.json();  
};

export const fetchUsers = async () => {  
  const response = await fetch(`${API_BASE}/users`);  
  if (!response.ok) throw new Error('Fetch users failed');  
  return response.json();  
};

export const fetchCourses = async () => {  
  const response = await fetch(`${API_BASE}/courses`);  
  if (!response.ok) throw new Error('Fetch courses failed');  
  return response.json();  
};

// New: Create a new user (POST)  
export const createUser = async (data) => {  
  const response = await fetch(`${API_BASE}/users`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) throw new Error('Create user failed');  
  return response.json();  
};

// Update: Ensure updateUser handles PUT  
export const updateUser = async (id, data) => {  
  const response = await fetch(`${API_BASE}/users/${id}`, {  
    method: 'PUT',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) throw new Error('Update user failed');  
  return response.json();  
};

// New: Delete a user (DELETE)  
export const deleteUser = async (id) => {  
  const response = await fetch(`${API_BASE}/users/${id}`, {  
    method: 'DELETE'  
  });  
  if (!response.ok) throw new Error('Delete user failed');  
  return response.json();  
};

export const updateCourse = async (id, data) => {  
  const response = await fetch(`${API_BASE}/courses/${id}`, {  
    method: 'PUT',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(data)  
  });  
  if (!response.ok) throw new Error('Update course failed');  
  return response.json();  
};

// Fetch assignments with optional params (teacher or courses)  
export const fetchAssignments = async (params = {}) => {  
  const url = new URL(`${API_BASE}/assignments`);  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));  
  const response = await fetch(url);  
  if (!response.ok) throw new Error('Fetch assignments failed');  
  return response.json();  
};

// Updated: Create assignment with FormData for files (no Content-Type header)  
export const createAssignment = async (data, files = []) => {  
  const formData = new FormData();  
  // Append JSON fields  
  Object.keys(data).forEach(key => formData.append(key, data[key]));  
  // Append files  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments`, {  
    method: 'POST',  
    body: formData  // Browser sets multipart/form-data  
  });  
  if (!response.ok) throw new Error('Create assignment failed');  
  return response.json();  
};

// Delete assignment  
export const deleteAssignment = async (id) => {  
  const response = await fetch(`${API_BASE}/assignments/${id}`, {  
    method: 'DELETE'  
  });  
  if (!response.ok) throw new Error('Delete assignment failed');  
  return response.json();  
};

// New: Submit student files for an assignment using FormData  
export const submitAssignment = async (assignmentId, studentId, files = []) => {  
  const formData = new FormData();  
  formData.append('student', studentId);  
  files.forEach(file => formData.append('files', file));  

  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {  
    method: 'POST',  
    body: formData  
  });  
  if (!response.ok) throw new Error('Submit assignment failed');  
  return response.json();  
};

// New: Fetch submissions for a specific assignment (for teachers)  
export const fetchAssignmentSubmissions = async (assignmentId) => {  
  const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`);  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};

// New: Fetch submissions filtered by student (for students)  
export const fetchSubmissions = async (params = {}) => {  
  const url = new URL(`${API_BASE}/submissions`);  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));  
  const response = await fetch(url);  
  if (!response.ok) throw new Error('Fetch submissions failed');  
  return response.json();  
};```
---
### StudentAssignments.js
```// Student assignments page: View assignments for enrolled courses as cards (read-only)
// Updated: Display teacher file download links
// New: Allow file uploads for submissions; display own submitted files as download links
// Fix: Use BACKEND_URL for download links to point to backend server

import React, { useState, useEffect } from 'react';  
import { fetchAssignments, submitAssignment, fetchSubmissions, BACKEND_URL } from './api';  // Updated: Import BACKEND_URL
import Navbar from './Navbar';

const StudentAssignments = () => {  
  const [assignments, setAssignments] = useState([]);  
  const [submissions, setSubmissions] = useState([]);  // Student's own submissions  
  const [files, setFiles] = useState({});  // Files per assignment ID for upload  
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments and submissions on mount  
  useEffect(() => {  
    const courses = user.currentCourses?.map(c => c.courseName) || [];  
    if (courses.length > 0) {  
      fetchAssignments({ courses: courses.join(',') })  
        .then(setAssignments)  
        .catch(console.error);  
      fetchSubmissions({ student: user._id })  // Fetch own submissions  
        .then(setSubmissions)  
        .catch(console.error);  
    }  
  }, [user.currentCourses, user._id]);

  // Handle file change for a specific assignment  
  const handleFileChange = (assignmentId, e) => {  
    setFiles(prev => ({ ...prev, [assignmentId]: Array.from(e.target.files) }));  
  };

  // Handle submit for a specific assignment  
  const handleSubmit = async (assignmentId) => {  
    try {  
      await submitAssignment(assignmentId, user._id, files[assignmentId] || []);  
      // Refresh submissions after submit  
      const updatedSubs = await fetchSubmissions({ student: user._id });  
      setSubmissions(updatedSubs);  
      setFiles(prev => ({ ...prev, [assignmentId]: [] }));  // Clear files  
    } catch (err) {  
      console.error('Submit error:', err);  
    }  
  };

  return (  
    <div>  
      <Navbar />  
      <h1>Assignments</h1>  
      <div className="horizontal-flex">  
        {assignments.map(a => {  
          const mySubmission = submissions.find(s => s.assignment?._id === a._id);  // Find own submission  
          return (  
            <div key={a._id} className="card">  
              <h3>{a.course}</h3>  
              <p>{a.description}</p>  
              <p>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>  
              {/* Display teacher uploaded files as download links */}  
              {a.teacherFiles?.length > 0 && (  
                <>  
                  <h4>Materials:</h4>  
                  <ul>  
                    {a.teacherFiles.map((file, idx) => (  
                      <li key={idx}>  
                        <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                      </li>  
                    ))}  
                  </ul>  
                </>  
              )}  
              {/* Submission section */}  
              <h4>Your Submission:</h4>  
              {mySubmission ? (  
                <>  
                  <p>Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</p>  
                  <ul>  
                    {mySubmission.files.map((file, idx) => (  
                      <li key={idx}>  
                        <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                      </li>  
                    ))}  
                  </ul>  
                  {/* Note: Resubmit not implemented in MVP; could add PUT route if needed */}  
                </>  
              ) : (  
                <>  
                  <input type="file" multiple onChange={(e) => handleFileChange(a._id, e)} />  
                  <button onClick={() => handleSubmit(a._id)}>Submit</button>  
                </>  
              )}  
            </div>  
          );  
        })}  
      </div>  
    </div>  
  );  
};

export default StudentAssignments;```
---
### Login.js
```javascript// Login component: Simple form to submit email/password// Redirects based on role using React Router// Updated: Stores logged-in user in localStorage for dashboard access (MVP temp persistence; clears on refresh)// Changes: Added app name header, centered form, larger fields/buttons
import React, { useState } from 'react';import { useNavigate } from 'react-router-dom';import { login } from './api';
const Login = () => {  const [email, setEmail] = useState('');  const [password, setPassword] = useState('');  const [error, setError] = useState('');  const navigate = useNavigate();
  const handleSubmit = async (e) => {    e.preventDefault();    setError('');    try {      const { role, user } = await login(email, password);      // Store user in localStorage for dashboards (JSON string)      localStorage.setItem('loggedInUser', JSON.stringify(user));      // Redirect based on role      if (role === 'admin') navigate('/admin/dashboard');      else if (role === 'teacher') navigate('/teacher/dashboard');      else if (role === 'student') navigate('/student/dashboard');    } catch (err) {      console.error('Login error:', err);      setError('Login failed. Check credentials or server status.');    }  };
  return (    <div className="login-container">      <h1>Uni-Portal</h1>      {error && <p style={{ color: 'red' }}>{error}</p>}      <form onSubmit={handleSubmit}>        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />        <button type="submit">Login</button>      </form>    </div>  );};
export default Login;```
---
### Account.js
```javascript// Account page: Displays user info based on role, allows password change// Simple form for update, uses API to PUT own user
import React, { useState } from 'react';import { updateUser } from './api';
const Account = () => {  const [user] = useState(JSON.parse(localStorage.getItem('loggedInUser') || '{}'));  const [newPassword, setNewPassword] = useState('');  const [error, setError] = useState('');
  const handleChangePassword = async () => {    if (!newPassword) return setError('Enter a new password');    try {      await updateUser(user._id, { password: newPassword });      setNewPassword('');      alert('Password updated');    } catch (err) {      setError('Update failed');    }  };
  return (    <div className="card">      <h1>Account Info</h1>      <p>Name: {user.fullName}</p>      <p>Email: {user.email}</p>      {user.role === 'student' && (        <>          <p>Major: {user.major}</p>          <p>Semester: {user.currentSemester}</p>          <p>Grad Date: {user.batch}</p>        </>      )}      {user.role === 'teacher' && (        <ul>          <h3>Courses Taught:</h3>          {user.coursesTaught?.map((course, idx) => <li key={idx}>{course}</li>)}        </ul>      )}      {/* Admin: just name/email - already shown */}      <h3>Change Password</h3>      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />      <button onClick={handleChangePassword}>Update Password</button>      {error && <p style={{ color: 'red' }}>{error}</p>}    </div>  );};
export default Account;```
---
### TeacherDashboard.js
```javascript// Teacher dashboard: Horizontal course cards, clickable to show student table// Table: email, name, current grade, new grade input// Master Update button batches all changes// Changes: Replaced simple header with Navbar component
import React, { useEffect, useState } from 'react';import { fetchCourses, fetchUsers, updateUser } from './api';import Navbar from './Navbar';
const TeacherDashboard = () => {  const [teacherData, setTeacherData] = useState(null);  const [courses, setCourses] = useState([]);  const [users, setUsers] = useState([]);  // For student names  const [selectedCourse, setSelectedCourse] = useState(null);  // Toggle table  const [pendingGrades, setPendingGrades] = useState({});  // { 'course-studentEmail': newGrade }
  useEffect(() => {    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');    setTeacherData(storedUser);
const loadData \= async () \=\> {  
  setCourses(await fetchCourses());  
  setUsers(await fetchUsers());  
};  
loadData();  

  }, []);
  if (!teacherData) return <p>Loading...</p>;
  const taughtCourses = courses.filter(c => teacherData.coursesTaught?.includes(c.name));
  const handleGradeChange = (courseName, studentEmail, newGrade) => {    setPendingGrades(prev => ({ ...prev, [`${courseName}-${studentEmail}`]: newGrade }));  };
  const handleUpdateAll = async () => {    const updates = [];    Object.entries(pendingGrades).forEach(([key, newGrade]) => {      if (newGrade) {        const [courseName, studentEmail] = key.split('-');        const student = users.find(u => u.email === studentEmail && u.role === 'student');        if (student) {          const updatedCourses = student.currentCourses.map(c =>            c.courseName === courseName ? { ...c, grade: newGrade } : c          );          updates.push(updateUser(student._id, { currentCourses: updatedCourses }));        }      }    });    try {      await Promise.all(updates);      setPendingGrades({});  // Clear      alert('Grades updated');    } catch (err) {      console.error('Batch update error:', err);    }  };
  return (    <div>      <h1>Teacher Dashboard</h1>      <div className="horizontal-flex">        {taughtCourses.map(course => (          <div key={course._id} className="card" style={{ cursor: 'pointer', width: '200px' }} onClick={() => setSelectedCourse(selectedCourse === course.name ? null : course.name)}>            <h3>{course.name}</h3>            <p>Enrolled: {course.enrolledStudents.length}</p>          </div>        ))}      </div>      {selectedCourse && (        <div className="card">          <h2>Students in {selectedCourse}</h2>          <table>            <thead>              <tr><th>Email</th><th>Name</th><th>Current Grade</th><th>New Grade</th></tr>            </thead>            <tbody>              {courses.find(c => c.name === selectedCourse)?.enrolledStudents.map(email => {                const student = users.find(u => u.email === email);                const currentGrade = student?.currentCourses.find(c => c.courseName === selectedCourse)?.grade || 'Pending';                return (                  <tr key={email}>                    <td>{email}</td>                    <td>{student?.fullName}</td>                    <td>{currentGrade}</td>                    <td>                      <input                        type="text"                        onChange={(e) => handleGradeChange(selectedCourse, email, e.target.value)}                        placeholder="New Grade"                      />                    </td>                  </tr>                );              })}            </tbody>          </table>          <button onClick={handleUpdateAll}>Update All Grades</button>        </div>      )}    </div>  );};
export default TeacherDashboard;```
---
### reportWebVitals.js
```javascriptconst reportWebVitals = onPerfEntry => {  if (onPerfEntry && onPerfEntry instanceof Function) {    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {      getCLS(onPerfEntry);      getFID(onPerfEntry);      getFCP(onPerfEntry);      getLCP(onPerfEntry);      getTTFB(onPerfEntry);    });  }};
export default reportWebVitals;```
---
### setupTests.js
```javascript// jest-dom adds custom jest matchers for asserting on DOM nodes.// allows you to do things like:// expect(element).toHaveTextContent(/react/i)// learn more: https://github.com/testing-library/jest-domimport '@testing-library/jest-dom';```
---
### App.test.js
```javascriptimport { render, screen } from '@testing-library/react';import App from './App';
test('renders learn react link', () => {  render(<App />);  const linkElement = screen.getByText(/learn react/i);  expect(linkElement).toBeInTheDocument();});```
---
## HTML & CSS Files
---
### public/index.html
```html<!DOCTYPE html><html lang="en">  <head>    <meta charset="utf-8" />    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />    <meta name="viewport" content="width=device-width, initial-scale=1" />    <meta name="theme-color" content="#000000" />    <meta      name="description"      content="Web site created using create-react-app"    />    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />    <!--      manifest.json provides metadata used when your web app is installed on a      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/    -->    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />    <!--      Notice the use of %PUBLIC_URL% in the tags above.      It will be replaced with the URL of the `public` folder during the build.      Only files inside the `public` folder can be referenced from the HTML.
  Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC\_URL%/favicon.ico" will  
  work correctly both with client-side routing and a non-root public URL.  
  Learn how to configure a non-root public URL by running \`npm run build\`.  
\--\>  
\<title\>React App\</title\>  

  </head>  <body>    <noscript>You need to enable JavaScript to run this app.</noscript>    <div id="root"></div>    <!--      This HTML file is a template.      If you open it directly in the browser, you will see an empty page.
  You can add webfonts, meta tags, or analytics to this file.  
  The build step will place the bundled scripts into the \<body\> tag.

  To begin the development, run \`npm start\` or \`yarn start\`.  
  To create a production bundle, use \`npm run build\` or \`yarn build\`.  
\--\>  

  </body></html>```
---
### src/index.css
```cssbody {  margin: 0;  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',    sans-serif;  -webkit-font-smoothing: antialiased;  -moz-osx-font-smoothing: grayscale;}
code {  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',    monospace;}```
---
### src/App.css
```css/* Global theme styles - simple variables for reuse *//* Main background: very dark grey (almost black) */:root {  --bg-main: #111111;  --accent-dark-red: #721010;  --accent-hover-red: #a52a2a; /* Lighter red for hover */  --text-white: #ffffff;  --card-grey: #333333; /* Grey for cards */  --contrast-bg: #242323; /* For buttons on red */}
/* Apply to body and app */body, #root {  background-color: var(--bg-main);  color: var(--text-white);  font-family: Arial, sans-serif;  margin: 0;  padding: 2rem; /* Increased padding for more space from borders */}
/* Cards: grey background with slight radius */.card {  background-color: var(--card-grey);  padding: 1.5rem; /* Slightly more padding for spacing */  border-radius: 8px; /* Slight border radius */  margin: 1.5rem 0; /* More margin for vertical spacing */}
/* Buttons: dark red default, larger, shadow, hover effect */button {  background-color: var(--accent-dark-red);  color: var(--text-white);  border: none;  padding: 0.75rem 1.5rem; /* Larger padding */  border-radius: 6px; /* Slight border radius */  cursor: pointer;  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow */  transition: background-color 0.3s ease; /* Smooth hover transition */}
button:hover {  background-color: var(--accent-hover-red);}
.card button {  background-color: var(--contrast-bg); /* Contrast for buttons on cards */}
.card button:hover {  background-color: #444444; /* Hover for contrast buttons */}
/* Tables: simple styling, dark red header row */table {  width: 100%;  border-collapse: collapse;  margin: 1rem 0; /* Spacing around tables */}
th {  background-color: var(--accent-dark-red); /* Dark red for top header row */  padding: 0.75rem;  text-align: left;}
td {  padding: 0.75rem;  text-align: left;  border-bottom: 1px solid var(--text-white);}
/* Forms: white text inputs, larger */input, select {  background-color: var(--contrast-bg);  color: var(--text-white);  border: 1px solid var(--accent-dark-red);  padding: 0.75rem; /* Larger padding */  margin: 0.75rem 0; /* More spacing */  font-size: 1.1rem; /* Slightly larger text */  width: 100%; /* Full width for better sizing */  box-sizing: border-box;}
/* Flex for horizontal layouts */.horizontal-flex {  display: flex;  flex-wrap: wrap;  gap: 1.5rem; /* Increased gap for more space */}
/* Navbar styling: dark red background, full width with internal spacing */.navbar {  background-color: var(--accent-dark-red);  padding: 1rem 2rem; /* Spacing for contents within navbar */  margin: -2rem -2rem 2rem -2rem; /* Negative margins to span full width, positive bottom for spacing below */  display: flex;  align-items: center;  justify-content: space-between;}
/* Dropdown for course selection */.dropdown {  background-color: var(--card-grey);  padding: 1rem;  border: 1px solid var(--accent-dark-red);  border-radius: 4px;  max-height: 200px;  overflow-y: auto;  margin-top: 0.5rem;}
.dropdown label {  display: block;  margin-bottom: 0.5rem;}
/* Centered login form */.login-container {  max-width: 400px;  margin: 0 auto;  text-align: center;}```  