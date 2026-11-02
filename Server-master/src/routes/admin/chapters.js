const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');
const QuizResult = require('../../models/QuizResult');

// GET /api/admin/chapters/:courseId
router.get(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const chapters = await Chapter.find({
      courseId: req.params.courseId,
    }).sort({ order: 1 });
    res.json(chapters);
  })
);

// POST /api/admin/chapters
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { courseId, title, description = '', order = 1, parentId = null } = req.body;
    if (!courseId || !title) {
      return res
        .status(400)
        .json({ message: 'courseId and title are required' });
    }
    const chapter = await Chapter.create({ courseId, title, description, order, parentId });
    res.status(201).json(chapter);
  })
);

const Problem = require('../../models/Problem');

// Recursive helper to delete a chapter and all its descendants
const deleteChapterRecursive = async (chapterId) => {
  // 1. Find and delete all sub-chapters (recursively)
  const subChapters = await Chapter.find({ parentId: chapterId });
  for (const sub of subChapters) {
    await deleteChapterRecursive(sub._id);
  }

  // 2. Delete all items in THIS chapter
  
  // Problems
  await Problem.deleteMany({ chapterId });

  // Quizzes & Related
  const quizzes = await Quiz.find({ chapterId });
  const quizIds = quizzes.map((q) => q._id);
  
  if (quizIds.length > 0) {
    await Question.deleteMany({ quizId: { $in: quizIds } });
    await QuizResult.deleteMany({ quizId: { $in: quizIds } });
    await Quiz.deleteMany({ chapterId });
  }

  // 3. Delete the chapter itself
  await Chapter.findByIdAndDelete(chapterId);
};

// DELETE /api/admin/chapters/:chapterId
router.delete(
  '/:chapterId',
  asyncHandler(async (req, res) => {
    const chapterId = req.params.chapterId;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    await deleteChapterRecursive(chapterId);

    res.status(204).send();
  })
);

// PUT /api/admin/chapters/:chapterId
router.put(
  '/:chapterId',
  asyncHandler(async (req, res) => {
    const { title, description, order, parentId } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (parentId !== undefined) updateData.parentId = parentId === "" ? null : parentId;

    const chapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      { $set: updateData },
      { new: true }
    );
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  })
);

// PUT /api/admin/chapters/bulk/reorder
router.put(
  '/bulk/reorder',
  asyncHandler(async (req, res) => {
    const { chapters } = req.body; // Array of { _id, order }
    if (!Array.isArray(chapters)) {
      return res.status(400).json({ message: 'Chapters array is required' });
    }

    const bulkOps = chapters.map((ch) => ({
      updateOne: {
        filter: { _id: ch._id },
        update: { $set: { order: ch.order } },
      },
    }));

    await Chapter.bulkWrite(bulkOps);
    res.json({ message: 'Chapters reordered successfully' });
  })
);

module.exports = router;
