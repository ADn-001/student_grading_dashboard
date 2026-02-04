// User model schema for all roles (student, teacher, admin)
// Embeds role-specific data for simplicity in MVP
// UPDATED: Passwords are hashed with bcrypt using pre-save hook (automatic salting)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Stored as bcrypt hash (salted)
  fullName: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    
  // Student-specific fields (ignored if not student)
  major: { type: String },
  batch: { type: String },
  currentYear: { type: Number },
  currentSemester: { type: String },
  currentCourses: [{
    courseName: { type: String },
    grade: { type: Number, min: 0, max: 100, default: null }  // Changed: Number instead of String, 0-100 scale
  }],
  completedCourses: [{
    courseName: { type: String },
    year: { type: Number },
    semester: { type: String },
    finalGrade: { type: Number, min: 0, max: 100 },           // Also changed to Number
    passed: { type: Boolean }
  }],
    
  // Teacher-specific fields (ignored if not teacher)
  department: { type: String },
  coursesTaught: [{ type: String }],  // Course names
    
  // Admin-specific fields (ignored if not admin)
  permissions: [{ type: String }]  // e.g., ['manageUsers']
});

// Pre-save hook: Hash password with bcrypt if modified (includes automatic salting)
userSchema.pre('save', async function() {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    // bcrypt.hash automatically generates salt and includes it in the hash (e.g., '$2b$10$...')
    const hashedPassword = await bcrypt.hash(this.password, 10); // 10 = salt rounds
    this.password = hashedPassword;
  } catch (err) {
    throw err;
  }
});

// Method to compare plaintext password with stored hash
userSchema.methods.comparePassword = async function(plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('User', userSchema);