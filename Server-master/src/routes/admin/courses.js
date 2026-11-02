const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');
const QuizResult = require('../../models/QuizResult');

// GET /api/admin/courses
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  })
);

// POST /api/admin/courses
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, description, type } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: 'title and description are required' });
    }
    const course = await Course.create({ title, description, type: type || 'QUIZ' });
    res.status(201).json(course);
  })
);

// PATCH /api/admin/courses/:courseId  — update title, description, isPublished
router.patch(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const { title, description, isPublished, type } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (isPublished !== undefined) update.isPublished = Boolean(isPublished);
    if (type !== undefined) update.type = type;
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      update,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  })
);

// DELETE /api/admin/courses/:courseId  (cascades to chapters → quizzes → questions/results)
router.delete(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const chapters = await Chapter.find({ courseId: req.params.courseId });
    const chapterIds = chapters.map((c) => c._id);
    const quizzes = await Quiz.find({ chapterId: { $in: chapterIds } });
    const quizIds = quizzes.map((q) => q._id);

    await Question.deleteMany({ quizId: { $in: quizIds } });
    await QuizResult.deleteMany({ quizId: { $in: quizIds } });
    await Quiz.deleteMany({ chapterId: { $in: chapterIds } });
    await Chapter.deleteMany({ courseId: req.params.courseId });

    res.status(204).send();
  })
);

module.exports = router;
