const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false },
    explanation: { type: String },
    image: { type: String },
    imageScale: { type: Number, default: 40 },
  },
  { timestamps: true }
);

testCaseSchema.index({ problemId: 1 });

module.exports = mongoose.model('TestCase', testCaseSchema);
