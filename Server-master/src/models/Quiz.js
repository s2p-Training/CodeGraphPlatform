const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    subChapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questionCount: { type: Number, required: true, min: 0, default: 0 },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    timeLimit: { type: Number, required: true, min: 1 }, // minutes
    isPublished: { type: Boolean, default: false },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  { timestamps: true }
);

quizSchema.index({ chapterId: 1 });
quizSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
