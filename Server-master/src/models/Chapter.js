const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 1 },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null
    },
  },
  { timestamps: true }
);

chapterSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
