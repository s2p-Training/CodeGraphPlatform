const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  openedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
