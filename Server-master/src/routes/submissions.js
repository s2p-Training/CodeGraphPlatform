const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');
const Submission = require('../models/Submission');
const UserProgress = require('../models/UserProgress');

router.use(authenticate);

// GET /api/submissions/solved - Get user's solved problem IDs
router.get('/solved', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const progress = await UserProgress.findOne({ user: userId });
  res.json({ success: true, data: progress ? progress.solvedProblems : [] });
}));

// GET /api/submissions - Get user's submissions
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { problemId } = req.query;
  
  const query = { user: userId };
  if (problemId) {
    query.problemId = problemId;
  }

  const submissions = await Submission.find(query)
    .populate('problemId', 'title')
    .sort({ submittedAt: -1 });
  
  res.json({ success: true, data: submissions });
}));

// POST /api/submissions - Save a submission
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { problemId, sourceCode, language, status, executionTimeMs, memoryUsageKb, testCasesPassed, totalTestCases } = req.body;

  const submission = new Submission({
    user: userId,
    problemId,
    sourceCode,
    language,
    status,
    executionTimeMs,
    memoryUsageKb,
    testCasesPassed,
    totalTestCases
  });

  await submission.save();

  // If accepted, mark problem as solved in progress
  if (status === 'ACCEPTED') {
    let progress = await UserProgress.findOne({ user: userId });
    if (!progress) {
      progress = new UserProgress({ user: userId });
    }
    progress.lastProblemId = problemId; // Set last solved problem as the resume point
    if (!progress.solvedProblems.includes(problemId)) {
      progress.solvedProblems.push(problemId);
    }
    await progress.save();
  }

  res.json({ success: true, data: submission });
}));

module.exports = router;
