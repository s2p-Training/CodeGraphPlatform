const mongoose = require('mongoose');
const Counter = require('./Counter');

const problemSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['CODING', 'LECTURE'], default: 'CODING' },
    videoUrl: { type: String },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    active: { type: Boolean, default: true },
    driverCode: { type: String },
    solutionTemplate: { type: String },
    editorialVideoUrl: { type: String },
    editorialPdfUrl: { type: String },
    editorialSolutions: [{
      type: { type: String, enum: ['BRUTE', 'BETTER', 'OPTIMAL'], required: true },
      title: { type: String },
      videoUrl: { type: String },
      pdfUrl: { type: String },
      intuition: { type: String },
      approach: { type: String },
      complexity: {
        time: { type: String },
        space: { type: String }
      },
      implementations: [{
        language: { type: String },
        code: { type: String }
      }]
    }],
    quizQuestion: { type: String },
    quizOptions: { type: String },
    quizCorrectAnswer: { type: String },
    footer: { type: String },
    image: { type: String },
    imageScale: { type: Number, default: 40 },
    springProblemId: { type: Number },
  },
  { timestamps: true }
);

problemSchema.index({ chapterId: 1 });

problemSchema.pre('save', async function(next) {
  if (this.isNew || !this.springProblemId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'problemId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.springProblemId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
