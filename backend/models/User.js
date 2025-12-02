// User model schema for all roles (student, teacher, admin)
// Embeds role-specific data for simplicity in MVP

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Plain text for demo only - NEVER use in production
  fullName: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  
  // Student-specific fields (ignored if not student)
  major: { type: String },
  batch: { type: String },
  currentYear: { type: Number },
  currentSemester: { type: String },
  currentCourses: [{
    courseName: { type: String },
    grade: { type: String }  // e.g., 'A' or null
  }],
  completedCourses: [{
    courseName: { type: String },
    year: { type: Number },
    semester: { type: String },
    finalGrade: { type: String },
    passed: { type: Boolean }
  }],
  
  // Teacher-specific fields (ignored if not teacher)
  department: { type: String },
  coursesTaught: [{ type: String }],  // Course names
  
  // Admin-specific fields (ignored if not admin)
  permissions: [{ type: String }]  // e.g., ['manageUsers']
});

module.exports = mongoose.model('User', userSchema);