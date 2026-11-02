const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const LoginLog = require('../../models/LoginLog');

// GET /api/admin/logs (with search/filter)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const [logs, total] = await Promise.all([
      LoginLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LoginLog.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
      }
    });
  })
);

// DELETE /api/admin/logs/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await LoginLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log deletedSuccessfully' });
  })
);

// POST /api/admin/logs/bulk-delete
router.post(
  '/bulk-delete',
  asyncHandler(async (req, res) => {
    const { ids, search } = req.body;
    
    let query = {};
    if (ids && ids.length) {
      query = { _id: { $in: ids } };
    } else if (search) {
      query = {
        $or: [
          { userName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const { deletedCount } = await LoginLog.deleteMany(query);
    res.json({ message: `Successfully deleted ${deletedCount} logs` });
  })
);

module.exports = router;
