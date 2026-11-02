const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const QuizResult = require('../../models/QuizResult');
const Course = require('../../models/Course');
const Quiz = require('../../models/Quiz');

router.use(authenticate);

// GET /api/results/my-results
router.get(
  '/my-results',
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id })
      .populate('quizId', 'title category')
      .sort({ createdAt: -1 });
    res.json(results);
  })
);

// GET /api/results/stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id })
      .populate('quizId', 'title courseId');

    const allCourses = await Course.find({ isPublished: true });
    
    // Sort results by date for streak calculation
    const sortedResults = [...results].sort((a, b) => b.createdAt - a.createdAt);
    
    // Calculate streak
    let streak = 0;
    if (sortedResults.length > 0) {
      const dates = new Set(sortedResults.map(r => new Date(r.createdAt).toDateString()));
      const dateArray = Array.from(dates);
      
      let current = new Date();
      // Adjust current date to match the timezone used in toDateString()
      let checkDateStr = current.toDateString();
      
      // If we don't have today's record, check yesterday. If we have neither, streak is 0.
      if (!dates.has(checkDateStr)) {
        current.setDate(current.getDate() - 1);
        checkDateStr = current.toDateString();
      }
      
      while (dates.has(checkDateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
        checkDateStr = current.toDateString();
      }
    }

    const stats = {
      totalQuizzes: results.length,
      averagePercentage: 0,
      bestSubject: 'N/A',
      worstSubject: 'N/A',
      strengthArea: 'N/A',
      weaknessArea: 'N/A',
      subjectWise: {},
      totalScore: 0,
      streak: streak,
      courseProgress: 0,
      professionalStatus: 'Beginner',
      activeDates: Array.from(new Set(results.map(r => new Date(r.createdAt).toISOString().split('T')[0]))),
      coursesStatus: []
    };

    if (results.length > 0) {
      let totalP = 0;
      const passedQuizzesPerCourse = {}; // courseId -> Set of quizIds
      
      // Fetch all quizzes for all courses to calculate total counts
      const quizzes = await Quiz.find({ isPublished: true });
      const quizzesPerCourse = {};
      quizzes.forEach(q => {
        if (!quizzesPerCourse[q.courseId]) quizzesPerCourse[q.courseId] = 0;
        quizzesPerCourse[q.courseId]++;
      });

      results.forEach((r) => {
        totalP += r.percentage;
        if (r.isPassed && r.quizId?.courseId) {
          const cId = r.quizId.courseId.toString();
          if (!passedQuizzesPerCourse[cId]) passedQuizzesPerCourse[cId] = new Set();
          passedQuizzesPerCourse[cId].add(r.quizId._id.toString());
        }
        
        const subj = 'General';
        if (!stats.subjectWise[subj]) {
          stats.subjectWise[subj] = { count: 0, totalP: 0, avg: 0 };
        }
        stats.subjectWise[subj].count++;
        stats.subjectWise[subj].totalP += r.percentage;
      });
      
      stats.averagePercentage = Math.round(totalP / results.length);
      
      // Calculate individual course progress
      stats.coursesStatus = allCourses.map(course => {
        const total = quizzesPerCourse[course._id.toString()] || 0;
        const passedCount = passedQuizzesPerCourse[course._id.toString()]?.size || 0;
        const progress = total > 0 ? Math.round((passedCount / total) * 100) : 0;
        return {
          id: course._id,
          title: course.title,
          progress,
          totalQuizzes: total,
          passedQuizzes: passedCount
        };
      });

      // Overall progress (at least one quiz passed in course)
      const coursesWithPassedQuizzes = Object.keys(passedQuizzesPerCourse).length;
      stats.courseProgress = allCourses.length > 0 ? Math.round((coursesWithPassedQuizzes / allCourses.length) * 100) : 0;
      
      // Determine professional status
      const score = stats.averagePercentage;
      const count = results.length;
      
      if (score >= 95 && count >= 20) stats.professionalStatus = 'Pro Master';
      else if (score >= 90 && count >= 15) stats.professionalStatus = 'Expert';
      else if (score >= 80 && count >= 10) stats.professionalStatus = 'Professional';
      else if (score >= 70 && count >= 5) stats.professionalStatus = 'Specialist';
      else if (count >= 3) stats.professionalStatus = 'Rookie';
      else stats.professionalStatus = 'Novice';
    }

    res.json(stats);
  })
);

module.exports = router;
