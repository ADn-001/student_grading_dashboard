// Simple Batch model

const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  graduationYear: { type: Number, required: true },
  major: { type: String }
});

module.exports = mongoose.model('Batch', batchSchema);