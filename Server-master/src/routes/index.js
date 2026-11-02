const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/stats', require('./stats'));
router.use('/admin', require('./admin'));
router.use('/quiz', require('./quiz'));
router.use('/results', require('./results'));
router.use('/integrity', require('./integrity'));

// Shared browsing routes (auth-required, not admin-only)
router.use('/courses', require('./courses'));
router.use('/chapters', require('./chapters'));
router.use('/problems', require('./problems'));
router.use('/quizzes', require('./quizzes'));
router.use('/submissions', require('./submissions'));
router.use('/contests', require('./contests'));
router.use('/batches', require('./batches'));
router.use('/proxy', require('./proxy'));

module.exports = router;
