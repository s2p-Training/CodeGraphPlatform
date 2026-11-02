const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');
const QuizResult = require('../../models/QuizResult');
const Chapter = require('../../models/Chapter');

const parseNonNegativeInt = (val) => {
  const parsed = Number(val);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const getAllDescendantIds = async (parentId) => {
  const children = await Chapter.find({ parentId });
  let ids = [parentId];
  for (const child of children) {
    const descendantIds = await getAllDescendantIds(child._id);
    ids = ids.concat(descendantIds);
  }
  return ids;
};

const parsePositiveInt = (val) => {
  const parsed = Number(val);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parsePercentage = (val) => {
  const parsed = Number(val);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
};

// GET /api/admin/quizzes/:chapterId
router.get(
  '/:chapterId',
  asyncHandler(async (req, res) => {
    const id = req.params.chapterId;
    const chapter = await Chapter.findById(id);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const allIds = await getAllDescendantIds(id);
    
    const query = {
      $or: [
        { chapterId: { $in: allIds } },
        { subChapterId: { $in: allIds } },
        { topicId: { $in: allIds } }
      ]
    };

    const quizzes = await Quiz.find(query).sort({
      createdAt: -1,
    });
    res.json(quizzes);
  })
);

// POST /api/admin/quizzes
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      chapterId,
      subChapterId,
      topicId,
      problemId,
      courseId,
      title,
      description,
      questionCount,
      passingScore,
      timeLimit,
    } = req.body;
    if (
      !chapterId ||
      !courseId ||
      !title ||
      questionCount == null ||
      passingScore == null ||
      timeLimit == null
    ) {
      return res.status(400).json({
        message:
          'chapterId, courseId, title, questionCount, passingScore, and timeLimit are required',
      });
    }

    const validQuestionCount = parseNonNegativeInt(questionCount);
    const validTimeLimit = parsePositiveInt(timeLimit);
    const validPassingScore = parsePercentage(passingScore);
    
    if (validQuestionCount === null) {
      return res.status(400).json({ message: 'questionCount must be a non-negative integer' });
    }
    if (validTimeLimit === null) {
      return res.status(400).json({ message: 'timeLimit must be a positive integer' });
    }
    if (validPassingScore === null) {
      return res.status(400).json({ message: 'passingScore must be between 0 and 100' });
    }

    const quiz = await Quiz.create({
      chapterId,
      subChapterId: subChapterId || null,
      topicId: topicId || null,
      problemId: problemId || null,
      courseId,
      title,
      description: description || '',
      questionCount: validQuestionCount,
      passingScore: validPassingScore,
      timeLimit: validTimeLimit,
      isPublished: false,
    });
    res.status(201).json(quiz);
  })
);

// PATCH /api/admin/quizzes/:quizId
// Update quiz details and ensure configured question count matches actual questions.
router.patch(
  '/:quizId',
  asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const updates = {};
    if (req.body.title != null) {
      const trimmedTitle = String(req.body.title).trim();
      if (!trimmedTitle) {
        return res.status(400).json({ message: 'title cannot be empty' });
      }
      updates.title = trimmedTitle;
    }
    if (req.body.description != null) updates.description = String(req.body.description);

    if (req.body.timeLimit != null) {
      const validTimeLimit = parsePositiveInt(req.body.timeLimit);
      if (!validTimeLimit) {
        return res.status(400).json({ message: 'timeLimit must be a positive integer' });
      }
      updates.timeLimit = validTimeLimit;
    }

    if (req.body.passingScore != null) {
      const validPassingScore = parsePercentage(req.body.passingScore);
      if (validPassingScore == null) {
        return res.status(400).json({ message: 'passingScore must be between 0 and 100' });
      }
      updates.passingScore = validPassingScore;
    }

    if (req.body.questions != null) {
      if (!Array.isArray(req.body.questions)) {
        return res.status(400).json({ message: 'questions must be an array of IDs' });
      }
      updates.questions = req.body.questions;
    }

    const currentQuestions = updates.questions ?? quiz.questions ?? [];
    const actualQuestionCount = currentQuestions.length;
    
    // Allow questionCount to be 0 or derived from actual questions
    const incomingQuestionCount = req.body.questionCount !== undefined 
      ? Number(req.body.questionCount) 
      : actualQuestionCount;

    if (isNaN(incomingQuestionCount) || incomingQuestionCount < 0) {
      return res.status(400).json({ message: 'questionCount must be a non-negative integer' });
    }

    // Only enforce strict matching if the quiz is being published or is already published
    const finalIsPublished = updates.isPublished ?? quiz.isPublished;
    if (finalIsPublished && incomingQuestionCount !== actualQuestionCount) {
      return res.status(400).json({
        message: `Published quizzes must have matching Configured count (${incomingQuestionCount}) and Actual questions (${actualQuestionCount})`,
      });
    }

    updates.questionCount = incomingQuestionCount;

    // AUTO-UNPUBLISH if count is 0
    if (incomingQuestionCount === 0) {
      updates.isPublished = false;
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.quizId, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  })
);

// PATCH /api/admin/quizzes/:quizId/publish
router.patch(
  '/:quizId/publish',
  asyncHandler(async (req, res) => {
    const existingQuiz = await Quiz.findById(req.params.quizId);
    if (!existingQuiz) return res.status(404).json({ message: 'Quiz not found' });

    const isPublishing = req.body.isPublished !== false;

    if (isPublishing) {
      const actualQuestionCount = existingQuiz.questions.length;
      const configuredCount = existingQuiz.questionCount || actualQuestionCount;
      
      if (actualQuestionCount === 0) {
        return res.status(400).json({
          message: 'Cannot publish a quiz with no questions',
        });
      }

      if (configuredCount !== actualQuestionCount) {
        // Automatically sync count to match actual questions on publish
        await Quiz.findByIdAndUpdate(req.params.quizId, { questionCount: actualQuestionCount });
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { isPublished: isPublishing },
      { new: true }
    );
    res.json(updatedQuiz);
  })
);

// DELETE /api/admin/quizzes/:quizId  (cascades to questions/results)
router.delete(
  '/:quizId',
  asyncHandler(async (req, res) => {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await QuizResult.deleteMany({ quizId: req.params.quizId });

    res.status(204).send();
  })
);

module.exports = router;
