const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const User = require('../../models/User');

// GET /api/admin/users
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const batchId = req.query.batchId || '';
    
    const query = {
      role: 'student', // Usually we manage students
      $and: [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    };

    if (batchId) {
      if (batchId === 'none') {
        query.$and.push({ batchId: null });
      } else {
        query.$and.push({ batchId: batchId });
      }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('batchId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// PATCH /api/admin/users/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    // If batchId is empty string, set it to null to avoid CastError
    if (req.body.batchId === "") req.body.batchId = null;
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('batchId', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  })
);

module.exports = router;
