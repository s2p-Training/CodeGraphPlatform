const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false, // Now optional as questions can exist in a pool
    },
    questionText: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    codeSnippet: { type: String, default: null },
    programmingLanguage: { type: String, default: null },
    explanation: { type: String, default: null },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2,
        message: 'A question must have at least 2 options',
      },
    },
    numberOfCorrectAnswers: { type: Number, required: true, min: 1 },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

questionSchema.index({ chapterId: 1, order: 1 });
questionSchema.index({ courseId: 1 });

module.exports = mongoose.model('Question', questionSchema);
