const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const QuizResult = require('../../models/QuizResult');

// GET /api/admin/leaderboard — all submissions across all quizzes
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { mode } = req.query;
    const filter = {};
    if (mode && ['test', 'training'].includes(mode)) {
      filter.mode = mode;
    }

    const results = await QuizResult.find(filter)
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .limit(1000);

    const entries = results.map((r) => ({
      resultId: r._id,
      userName: r.userId?.name || 'Unknown',
      userEmail: r.userId?.email || '',
      quizTitle: r.quizId?.title || 'Deleted Quiz',
      quizId: r.quizId?._id || null,
      score: r.score,
      totalQuestions: r.totalQuestions,
      percentage: r.percentage,
      isPassed: r.isPassed,
      timeTaken: r.timeTaken,
      mode: r.mode || 'test',
      createdAt: r.createdAt,
    }));

    res.json(entries);
  })
);

// DELETE /api/admin/leaderboard/bulk — delete filtered or all records
router.post(
  '/bulk-delete',
  asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const result = await QuizResult.deleteMany({ _id: { $in: ids } });
      return res.json({ 
        message: `${result.deletedCount} filtered records deleted successfully`,
        deletedCount: result.deletedCount 
      });
    }

    // If no IDs provided, delete everything (requires explicit confirmation on frontend)
    const result = await QuizResult.deleteMany({});
    res.json({ 
      message: 'All leaderboard records deleted successfully',
      deletedCount: result.deletedCount
    });
  })
);

// DELETE /api/admin/leaderboard/:resultId
router.delete(
  '/:resultId',
  asyncHandler(async (req, res) => {
    const result = await QuizResult.findByIdAndDelete(req.params.resultId);
    if (!result) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  })
);

// GET /api/admin/leaderboard/:quizId
// Sorted by percentage desc, then timeTaken asc (fastest wins on tie)
router.get(
  '/:quizId',
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ quizId: req.params.quizId })
      .populate('userId', 'name')
      .sort({ percentage: -1, timeTaken: 1 });

    const entries = results.map((r) => ({
      resultId: r._id,
      userName: r.userId?.name || 'Unknown',
      score: r.score,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
      mode: r.mode || 'test',
      createdAt: r.createdAt,
    }));

    res.json(entries);
  })
);

module.exports = router;
