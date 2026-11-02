const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const QuizResult = require('../../models/QuizResult');
const Problem = require('../../models/Problem');

router.use(authenticate);

// GET /api/courses  — enriched with chapter counts, quiz counts, and student progress
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type } = req.query;
    const filter = req.user.role !== 'admin' ? { isPublished: true } : {};
    if (type) filter.type = type;
    const baseCourses = await Course.find(filter).sort({ createdAt: -1 });

    const enrichedCourses = await Promise.all(baseCourses.map(async (course) => {
      // 1. Get Chapters for this course
      const chapters = await Chapter.find({ courseId: course._id });
      const chapterIds = chapters.map(c => c._id);
      
      // 2. Get Count of published quizzes in these chapters
      const quizFilter = { chapterId: { $in: chapterIds } };
      if (req.user.role !== 'admin') {
        quizFilter.isPublished = true;
      }
      const quizzes = await Quiz.find(quizFilter);
      const quizIds = quizzes.map(q => q._id);

      // 3. Get Completed (Passed) Quizzes for this user
      let completedCount = 0;
      let completedChapterCount = 0;
      if (quizIds.length > 0) {
        // Distinct passed quizzes (must be isPassed: true)
        const passedResults = await QuizResult.distinct('quizId', {
          userId: req.user.id,
          quizId: { $in: quizIds },
          isPassed: true
        });
        completedCount = passedResults.length;

        // Calculate completed chapters
        for (const chapter of chapters) {
          const chapterQuizzes = quizzes.filter(q => q.chapterId.toString() === chapter._id.toString());
          if (chapterQuizzes.length > 0) {
            const chapterQuizIds = chapterQuizzes.map(q => q._id.toString());
            const passedChapterQuizzes = passedResults.filter(rid => chapterQuizIds.includes(rid.toString()));
            if (passedChapterQuizzes.length === chapterQuizzes.length) {
              completedChapterCount++;
            }
          }
        }
      }

      // 4. Get Total Questions / Problems
      let totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);
      const courseProblems = await Problem.find({ chapterId: { $in: chapterIds }, active: true });
      const problemCount = courseProblems.length;
      // Use generic 0 for now as completion is tracked in CodeGraph
      const completedProblemCount = 0; 

      return {
        ...course.toObject(),
        chapterCount: chapters.length,
        completedChapterCount,
        quizCount: quizzes.length,
        completedQuizCount: completedCount,
        problemCount,
        completedProblemCount,
        totalQuestions,
        progress: (quizzes.length + problemCount) > 0
          ? Math.round(((completedCount + completedProblemCount) / (quizzes.length + problemCount)) * 100)
          : 0
      };
    }));

    res.json(enrichedCourses);
  })
);

module.exports = router;
