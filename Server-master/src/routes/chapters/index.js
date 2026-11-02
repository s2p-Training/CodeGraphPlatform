const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const QuizResult = require('../../models/QuizResult');
const Problem = require('../../models/Problem');
const Contest = require('../../models/Contest');

router.use(authenticate);

// GET /api/chapters/:courseId  — enriched with quiz counts and completion status
router.get(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const allChapters = await Chapter.find({
      courseId: req.params.courseId,
    }).sort({ order: 1 });

    const allProblems = await Problem.find({
      chapterId: { $in: allChapters.map(c => c._id) }
    }).populate('tags');

    const allQuizzes = await Quiz.find({
      chapterId: { $in: allChapters.map(c => c._id) }
    });

    const allContests = await Contest.find({
      chapterId: { $in: allChapters.map(c => c._id) },
      isPublished: true
    });

    // 1. Get Completed (Passed) Quizzes for this user
    const passedResults = await QuizResult.distinct('quizId', {
      userId: req.user.id,
      quizId: { $in: allQuizzes.map(q => q._id) },
      isPassed: true
    });

    const passedQuizIds = new Set(passedResults.map(id => id.toString()));

    // Recursive helper to build tree and aggregate counts
    const buildTree = (parentId = null) => {
      return allChapters
        .filter(c => String(c.parentId || null) === String(parentId || null))
        .map(chapter => {
          const chapterObj = chapter.toObject();
          
          // Items in THIS chapter level
          const directProblems = allProblems.filter(p => p.chapterId.toString() === chapter._id.toString());
          const directQuizzes = allQuizzes.filter(q => q.chapterId.toString() === chapter._id.toString());
          const directContests = allContests.filter(c => c.chapterId.toString() === chapter._id.toString());
          
          chapterObj.problems = directProblems;
          chapterObj.quizzes = directQuizzes;
          chapterObj.contests = directContests;
          
          // Recursive sub-chapters
          const subChapters = buildTree(chapter._id);
          chapterObj.subChapters = subChapters;

          // Aggregated stats (Direct + Recursive)
          let totalQuizzes = directQuizzes.length;
          let totalPassedQuizzes = directQuizzes.filter(q => passedQuizIds.has(q._id.toString())).length;
          let totalProblems = directProblems.length;
          let totalPassedProblems = 0; // Completion tracked elsewhere for now

          subChapters.forEach(sub => {
            totalQuizzes += sub.quizCount || 0;
            totalPassedQuizzes += sub.completedQuizCount || 0;
            totalProblems += sub.problemCount || 0;
            totalPassedProblems += sub.completedProblemCount || 0;
          });

          chapterObj.quizCount = totalQuizzes;
          chapterObj.completedQuizCount = totalPassedQuizzes;
          chapterObj.problemCount = totalProblems;
          chapterObj.completedProblemCount = totalPassedProblems;
          
          return chapterObj;
        });
    };

    const tree = buildTree();
    res.json(tree);
  })
);

module.exports = router;
