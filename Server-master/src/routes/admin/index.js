const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');

// All /api/admin/* routes require a valid JWT with role=admin
router.use(authenticate, requireAdmin);

router.use('/courses', require('./courses'));
router.use('/chapters', require('./chapters'));
router.use('/quizzes', require('./quizzes'));
router.use('/questions', require('./questions'));
router.use('/problems', require('./problems'));
router.use('/upload', require('./upload'));
router.use('/contests', require('./contests'));
router.use('/stats', require('./stats'));
router.use('/leaderboard', require('./leaderboard'));
router.use('/logs', require('./logs'));
router.use('/bans', require('./bans'));
router.use('/batches', require('./batches'));
router.use('/users', require('./users'));

module.exports = router;
