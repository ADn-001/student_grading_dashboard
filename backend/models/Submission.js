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