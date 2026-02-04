// Main Express server for backend  
// Connects to MongoDB, sets up routes, listens on port 5000

require('dotenv').config(); // Load environment variables from .env
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

// Removed static file serving of /uploads - now using secure download routes

app.use(cors({  
  origin: 'http://localhost:3000'  // Allow frontend origin  
}));  
// Middleware for parsing JSON (minimal for MVP)  
app.use(express.json());

// Hardcoded MongoDB connection (local for demo - no .env)  
mongoose.connect('mongodb://localhost:27017/uniportal')  
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