const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    isPublished: { type: Boolean, default: false },
    type: { type: String, enum: ['QUIZ', 'PROGRAMMING', 'MIXED'], default: 'MIXED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
