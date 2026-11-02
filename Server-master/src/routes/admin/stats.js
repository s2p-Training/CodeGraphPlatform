const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');

/**
 * GET /api/admin/stats/summary
 * Returns total counts for global dashboard.
 */
router.get('/summary', asyncHandler(async (req, res) => {
  const [courses, chapters, quizzes, questions] = await Promise.all([
    Course.countDocuments(),
    Chapter.countDocuments(),
    Quiz.countDocuments(),
    Question.countDocuments()
  ]);
  
  res.json({
    courses,
    chapters,
    quizzes,
    questions
  });
}));

module.exports = router;
