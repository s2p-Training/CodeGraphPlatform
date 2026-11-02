const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');
const scoringService = require('../../services/scoringService');

// All quiz play routes require a valid JWT
router.use(authenticate);

// GET /api/quiz/all  — published quizzes (student browsing)
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    if (req.user.role === 'admin') {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      return res.json(quizzes);
    }

    const liveCourses = await Course.find({ isPublished: true }).select('_id');
    const liveCourseIds = liveCourses.map((course) => course._id);
    const liveChapters = await Chapter.find({ courseId: { $in: liveCourseIds } }).select('_id');
    const liveChapterIds = liveChapters.map((chapter) => chapter._id);

    const quizzes = await Quiz.find({
      isPublished: true,
      chapterId: { $in: liveChapterIds },
    }).sort({
      createdAt: -1,
    });
    res.json(quizzes);
  })
);

// POST /api/quiz/submit
router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const { quizId, answers, timeTaken, mode } = req.body;
    if (!quizId || !Array.isArray(answers) || timeTaken == null) {
      return res
        .status(400)
        .json({ message: 'quizId, answers, and timeTaken are required' });
    }
    const result = await scoringService.submitQuiz(
      quizId,
      req.user.id,
      answers,
      timeTaken,
      req.user.role,
      mode
    );
    // Frontend reads response.data.result
    res.json({ result });
  })
);

// GET /api/quiz/:quizId  — quiz + its questions
// Admins can preview unpublished quizzes; students only see published ones.
router.get(
  '/:quizId',
  asyncHandler(async (req, res) => {
    const filter = { _id: req.params.quizId };
    if (req.user.role !== 'admin') {
      filter.isPublished = true;
    }
    const quiz = await Quiz.findOne(filter);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Fetch questions by IDs and maintain the order from quiz.questions
    const questions = await Question.find({ _id: { $in: quiz.questions } });
    
    // Sort questions according to the order in quiz.questions
    const orderedQuestions = quiz.questions.map(id => 
      questions.find(q => q._id.toString() === id.toString())
    ).filter(q => !!q);

    const configuredQuestionCount =
      Number.isInteger(quiz.questionCount) && quiz.questionCount > 0
        ? quiz.questionCount
        : orderedQuestions.length;

    if (configuredQuestionCount !== orderedQuestions.length) {
      return res.status(400).json({
        message: `Configured questionCount (${configuredQuestionCount}) and actual selected questions (${orderedQuestions.length}) are not same`,
      });
    }

    res.json({ quiz, questions: orderedQuestions });
  })
);

module.exports = router;
