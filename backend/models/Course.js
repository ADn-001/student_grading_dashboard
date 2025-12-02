// Course model schema with embedded enrollments for simplicity

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  teacher: { type: String },  // Teacher fullName or email
  major: { type: String },
  yearOffered: { type: Number },
  semesterOffered: { type: String },
  enrolledStudents: [{ type: String }]  // Student emails or names
});

module.exports = mongoose.model('Course', courseSchema);