const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const authService = require('../../services/authService');
const BanLog = require('../../models/BanLog');
const User = require('../../models/User');

// GET /api/admin/bans - Get all CURRENTLY banned users or WARNING sessions
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type || 'banned'; // 'banned' or 'warnings'
    const skip = (page - 1) * limit;

    let query = type === 'warnings' 
      ? { isBanned: false, violationCount: { $gt: 0 } }
      : { isBanned: true };

    if (search) {
      query.$and = [
        type === 'warnings' ? { isBanned: false, violationCount: { $gt: 0 } } : { isBanned: true },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { banReason: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const matchedUsers = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Map User objects to the format expected by frontend
    const logs = matchedUsers.map(user => ({
      _id: user._id, 
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      reason: type === 'warnings' 
        ? `TAB SWITCH DETECTED (${user.violationCount}/4 strikes)`
        : (user.banReason || 'Academic Integrity Violation'),
      action: type === 'warnings' ? 'warning' : 'ban',
      performedBy: 'SYSTEM',
      createdAt: user.updatedAt,
      violationCount: user.violationCount
    }));

    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        type // Return the type back to frontend
      }
    });
  })
);

// POST /api/admin/bans/unban/:userId
router.post(
  '/unban/:userId',
  asyncHandler(async (req, res) => {
    const result = await authService.unbanUser(req.params.userId, 'ADMIN');
    res.json(result);
  })
);

module.exports = router;
