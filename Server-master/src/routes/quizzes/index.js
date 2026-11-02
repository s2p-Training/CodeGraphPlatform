const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const QuizResult = require('../../models/QuizResult');

router.use(authenticate);

// GET /api/quizzes/:chapterId
// Admins see ALL quizzes (so they can add questions to unpublished ones).
// Students see published quizzes only.
router.get(
  '/:chapterId',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      const chapter = await Chapter.findById(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }

      const course = await Course.findById(chapter.courseId);
      if (!course || !course.isPublished) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
    }

    const filter = { chapterId: req.params.chapterId };
    if (req.user.role !== 'admin') {
      filter.isPublished = true;
    }
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    const enrichedQuizzes = await Promise.all(quizzes.map(async (quiz) => {
      let isCompleted = false;
      const passedResult = await QuizResult.findOne({
        userId: req.user.id,
        quizId: quiz._id,
        isPassed: true
      });
      isCompleted = !!passedResult;
      return {
        ...quiz.toObject(),
        isCompleted
      };
    }));

    res.json(enrichedQuizzes);
  })
);

module.exports = router;
