const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Question = require('../../models/Question');
const Chapter = require('../../models/Chapter');

const getAllDescendantIds = async (parentId) => {
  const children = await Chapter.find({ parentId });
  let ids = [parentId];
  for (const child of children) {
    const descendantIds = await getAllDescendantIds(child._id);
    ids = ids.concat(descendantIds);
  }
  return ids;
};

const validateQuestionPayload = (payload) => {
  const options = Array.isArray(payload.options) ? payload.options : null;
  const expected = Number(payload.numberOfCorrectAnswers);

  if (!options || options.length < 2) {
    return 'A question must have at least 2 options';
  }

  const actualCorrect = options.filter((opt) => Boolean(opt.isCorrect)).length;
  if (!Number.isInteger(expected) || expected < 1) {
    return 'numberOfCorrectAnswers must be a positive integer';
  }
  if (actualCorrect !== expected) {
    return `numberOfCorrectAnswers (${expected}) must match actual correct options (${actualCorrect})`;
  }

  return null;
};

// GET /api/admin/questions/course/:courseId
router.get(
  '/course/:courseId',
  asyncHandler(async (req, res) => {
    const questions = await Question.find({ courseId: req.params.courseId }).sort({
      order: 1,
    });
    res.json(questions);
  })
);

// GET /api/admin/questions/:chapterId
// Fetches questions for a specific chapter and all its descendants
router.get(
  '/:chapterId',
  asyncHandler(async (req, res) => {
    const allIds = await getAllDescendantIds(req.params.chapterId);
    const questions = await Question.find({ chapterId: { $in: allIds } }).sort({
      order: 1,
    });
    res.json(questions);
  })
);

// POST /api/admin/questions
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      chapterId,
      courseId,
      questionText,
      options,
      numberOfCorrectAnswers,
      order,
      image,
      codeSnippet,
      programmingLanguage,
      explanation,
    } = req.body;

    if (!chapterId || !courseId || !questionText || !options || numberOfCorrectAnswers == null) {
      return res.status(400).json({
        message: 'chapterId, courseId, questionText, options, and numberOfCorrectAnswers are required',
      });
    }

    const validationError = validateQuestionPayload({
      options,
      numberOfCorrectAnswers,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const question = await Question.create({
      chapterId,
      courseId,
      questionText,
      options,
      numberOfCorrectAnswers,
      order: order ?? 1,
      image: image || null,
      codeSnippet: codeSnippet || null,
      programmingLanguage: programmingLanguage || null,
      explanation: explanation || null,
    });
    res.status(201).json(question);
  })
);

// PATCH /api/admin/questions/:questionId
router.patch(
  '/:questionId',
  asyncHandler(async (req, res) => {
    if (req.body.options || req.body.numberOfCorrectAnswers != null) {
      const existing = await Question.findById(req.params.questionId);
      if (!existing)
        return res.status(404).json({ message: 'Question not found' });

      const mergedPayload = {
        options: req.body.options ?? existing.options,
        numberOfCorrectAnswers:
          req.body.numberOfCorrectAnswers ?? existing.numberOfCorrectAnswers,
      };
      const validationError = validateQuestionPayload(mergedPayload);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
    }

    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question)
      return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  })
);

// DELETE /api/admin/questions/:questionId
router.delete(
  '/:questionId',
  asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: 'Question not found' });
    res.status(204).send();
  })
);

module.exports = router;
