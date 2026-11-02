const express = require('express');
const router = express.Router();
const Contest = require('../../models/Contest');
const Problem = require('../../models/Problem');
const Question = require('../../models/Question');

// Get all contests
router.get('/', async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('mcqQuestions', 'questionText')
      .populate('codingProblems', 'title difficulty')
      .sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single contest
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('mcqQuestions')
      .populate('codingProblems');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create contest
router.post('/', async (req, res) => {
  try {
    const { title, description, startTime, endTime, duration, mcqQuestions, codingProblems, courseId, chapterId } = req.body;
    
    // Logic check: at least 2 coding problems as requested by user (or up to 2)
    if (codingProblems && codingProblems.length > 2) {
      return res.status(400).json({ message: 'A contest can have maximum 2 coding problems' });
    }

    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
      duration,
      mcqQuestions,
      codingProblems,
      courseId,
      chapterId,
      createdBy: req.user.id
    });

    const savedContest = await contest.save();
    res.status(201).json(savedContest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update contest
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startTime, endTime, duration, mcqQuestions, codingProblems, isPublished, courseId, chapterId } = req.body;
    
    if (codingProblems && codingProblems.length > 2) {
      return res.status(400).json({ message: 'A contest can have maximum 2 coding problems' });
    }

    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { title, description, startTime, endTime, duration, mcqQuestions, codingProblems, isPublished, courseId, chapterId },
      { new: true }
    );

    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete contest
router.delete('/:id', async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json({ message: 'Contest deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
