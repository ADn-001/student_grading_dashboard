// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
