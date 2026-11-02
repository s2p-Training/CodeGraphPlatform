const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Batch = require('../../models/Batch');
const User = require('../../models/User');

// GET /api/admin/batches
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  })
);

// POST /api/admin/batches
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Batch name is required' });
    }
    const batch = await Batch.create({ name, description });
    res.status(201).json(batch);
  })
);

// PATCH /api/admin/batches/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  })
);

// DELETE /api/admin/batches/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if any users are assigned to this batch
    const userCount = await User.countDocuments({ batchId: req.params.id });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete batch. There are ${userCount} students assigned to it. Move them first.` 
      });
    }

    await batch.deleteOne();
    res.json({ message: 'Batch deleted successfully' });
  })
);

module.exports = router;
