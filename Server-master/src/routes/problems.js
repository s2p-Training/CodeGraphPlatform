const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const UserProgress = require('../models/UserProgress');
const Chapter = require('../models/Chapter');

router.use(authenticate);

// GET /api/problems - List problems with pagination and filters
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;
  const { chapterId, courseId } = req.query;
  
  const filter = { active: true };
  
  if (chapterId) {
    filter.chapterId = chapterId;
  } else if (courseId) {
    // Find all chapters belonging to this course
    const chapters = await Chapter.find({ courseId }).select('_id');
    const chapterIds = chapters.map(c => c._id);
    filter.chapterId = { $in: chapterIds };
  }

  const problems = await Problem.find(filter)
    .populate('tags')
    .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });
    
  const totalElements = await Problem.countDocuments(filter);
  
  res.json({
    success: true,
    data: {
      content: problems,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      number: page,
      size: size
    }
  });
}));

// GET /api/problems/:id - Get specific problem
router.get('/:id', asyncHandler(async (req, res) => {
  // Populate tags and chapter hierarchy for perfect state restoration in admin
  const problem = await Problem.findById(req.params.id)
    .populate('tags')
    .populate({
      path: 'chapterId',
      populate: { path: 'parentId' }
    })
    .lean();
    
  if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
  
  // Attach all test cases (now allowed for students)
  const testCases = await TestCase.find({ problemId: req.params.id }).lean();
  problem.testCases = testCases;
  
  res.json({ success: true, data: problem });
}));

// GET /api/problems/:id/testcases - Get sample test cases
router.get('/:id/testcases', asyncHandler(async (req, res) => {
  const testCases = await TestCase.find({ problemId: req.params.id, isSample: true });
  res.json({ success: true, data: testCases });
}));

// GET /api/problems/:id/testcases/all - Get ALL test cases (including hidden)
router.get('/:id/testcases/all', asyncHandler(async (req, res) => {
  const testCases = await TestCase.find({ problemId: req.params.id });
  res.json({ success: true, data: testCases });
}));

// POST /api/problems/:id/track - Track user progress (last opened problem)
router.post('/:id/track', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const problemId = req.params.id;

  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = new UserProgress({ user: userId });
  }

  if (!progress.openedProblems.includes(problemId)) {
    progress.openedProblems.push(problemId);
  }
  progress.updatedAt = new Date();
  await progress.save();

  res.json({ success: true, message: 'Progress tracked' });
}));

// GET /api/problems/resume - Get the last problem ID to resume
router.get('/resume/last', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const progress = await UserProgress.findOne({ user: userId });
  
  res.json({ 
    success: true, 
    data: progress ? progress.lastProblemId : null 
  });
}));

module.exports = router;
