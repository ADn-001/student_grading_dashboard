// Main Express server for backend
// Connects to MongoDB, sets up routes, listens on port 5000

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const cors = require('cors');

const app = express();
const PORT = 5000;

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

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});