const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');

// POST /api/integrity/violation - Student triggers their own ban (tab switch)
router.post(
  '/violation',
  authenticate,
  asyncHandler(async (req, res) => {
    const { reason, isFinal } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'reason is required' });
    }
    
    if (isFinal) {
      const result = await authService.banUser(req.user.id, reason, 'SYSTEM');
      return res.json({ message: 'Academic Integrity Violation Registered. Account Suspended.', user: result });
    } else {
      const result = await authService.logViolation(req.user.id, reason, 'SYSTEM');
      return res.json({ message: 'Warning Registered in Audit Log.', user: result });
    }
  })
);

module.exports = router;
