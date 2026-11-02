const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOptions: { type: [Number], default: [] },
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    timeTaken: { type: Number, required: true }, // seconds
    mode: { type: String, enum: ['test', 'training'], default: 'test' },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ quizId: 1, percentage: -1, timeTaken: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
