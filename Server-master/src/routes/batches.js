const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const Batch = require('../models/Batch');
const { authenticate } = require('../middleware/auth');

// GET /api/batches - List all available batches for selection
// Requires authentication but NOT admin role
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const batches = await Batch.find().sort({ name: 1 });
    res.json(batches);
  })
);

module.exports = router;
