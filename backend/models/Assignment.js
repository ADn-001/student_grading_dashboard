// backend/models/Assignment.js
// New model for assignments

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
});

module.exports = mongoose.model('Assignment', assignmentSchema);