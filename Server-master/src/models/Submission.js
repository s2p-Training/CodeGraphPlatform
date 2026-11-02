const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  sourceCode: { type: String, required: true },
  language: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'PENDING'],
    default: 'PENDING' 
  },
  executionTimeMs: { type: Number, default: 0 },
  memoryUsageKb: { type: Number, default: 0 },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  isRun: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
