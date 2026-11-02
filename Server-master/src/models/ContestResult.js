const mongoose = require('mongoose');

const mcqAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: Number },
  isCorrect: { type: Boolean }
}, { _id: false });

const codingAnswerSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  submissionId: { type: String },
  status: { type: String },
  score: { type: Number, default: 0 },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  executionTimeMs: { type: Number },
  memoryKb: { type: Number }
}, { _id: false });

const violationSchema = new mongoose.Schema({
  type: { type: String, enum: ['BLUR', 'VISIBILITY_HIDDEN', 'FULLSCREEN_EXIT', 'REFRESH_ATTEMPT'] },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Map, of: String }
}, { _id: false });

const contestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  
  mcqPartialScore: { type: Number, default: 0 },
  codingPartialScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  efficiency: { type: Number, default: 0 },
  
  mcqAnswers: [mcqAnswerSchema],
  codingAnswers: [codingAnswerSchema],
  
  violations: [violationSchema],
  
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: Date.now },
  durationSeconds: { type: Number },
}, { timestamps: true });

contestResultSchema.index({ contestId: 1, totalScore: -1 });
contestResultSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('ContestResult', contestResultSchema);
