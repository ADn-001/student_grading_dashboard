// Model for assignments

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({  
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  course: { type: String, required: true },  
  description: { type: String, required: true },  
  deadline: { type: Date, required: true },  
  teacherFiles: [{ type: String }]  // Added: Array of file paths for teacher uploads (e.g., assignment materials)  
});

module.exports = mongoose.model('Assignment', assignmentSchema);  