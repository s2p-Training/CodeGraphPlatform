const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middleware/asyncHandler');
const Problem = require('../../models/Problem');
const TestCase = require('../../models/TestCase');
const Tag = require('../../models/Tag');

// POST /api/admin/problems - Create problem
router.post('/', asyncHandler(async (req, res) => {
  const { tags: rawTags, testCases, ...problemData } = req.body;

  let tagNames = rawTags;
  if (typeof tagNames === 'string') {
    tagNames = tagNames.split(',').map(t => t.trim()).filter(t => t !== "");
  }

  // Handle tags
  const tags = [];
  if (tagNames && Array.isArray(tagNames)) {
    for (const item of tagNames) {
      const name = typeof item === 'string' ? item : item.name;
      if (!name) continue;
      
      let tag = await Tag.findOne({ name });
      if (!tag) {
        tag = await Tag.create({ name });
      }
      tags.push(tag._id);
    }
  }
  
  const problem = await Problem.create({ ...problemData, tags });
  const populatedProblem = await Problem.findById(problem._id).populate('tags');

  // Handle test cases
  if (testCases && Array.isArray(testCases)) {
    const casesToInsert = testCases.map(tc => ({
      ...tc,
      problemId: problem._id
    }));
    await TestCase.insertMany(casesToInsert);
  }

  res.json({ success: true, data: populatedProblem });
}));

// PUT /api/admin/problems/:id - Update problem
router.put('/:id', asyncHandler(async (req, res) => {
  const { tags: rawTags, testCases, ...problemData } = req.body;
  
  let tagNames = rawTags;
  if (typeof tagNames === 'string') {
    tagNames = tagNames.split(',').map(t => t.trim()).filter(t => t !== "");
  }

  const updateData = { ...problemData };
  if (tagNames && Array.isArray(tagNames)) {
    const tags = [];
    for (const item of tagNames) {
      const name = typeof item === 'string' ? item : item.name;
      if (!name) continue;

      let tag = await Tag.findOne({ name });
      if (!tag) tag = await Tag.create({ name });
      tags.push(tag._id);
    }
    updateData.tags = tags;
  }
  
  const problem = await Problem.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('tags');

  // Sync test cases: Replace existing with new list
  if (testCases && Array.isArray(testCases)) {
    // Delete existing
    await TestCase.deleteMany({ problemId: req.params.id });
    
    // Insert new list (assign correct problemId and remove old _id if present from frontend)
    const casesToInsert = testCases.map(({ _id, ...tc }) => ({
      ...tc,
      problemId: req.params.id
    }));
    
    if (casesToInsert.length > 0) {
      await TestCase.insertMany(casesToInsert);
    }
  }

  res.json({ success: true, data: problem });
}));

// POST /api/admin/problems/:id/testcases - Add test cases
router.post('/:id/testcases', asyncHandler(async (req, res) => {
  const testCasesData = req.body; // Array of test cases
  const results = [];
  
  for (const tc of testCasesData) {
    const testCase = await TestCase.create({ ...tc, problemId: req.params.id });
    results.push(testCase);
  }
  
  res.json({ success: true, data: results });
}));

// GET /api/admin/problems/:id/testcases/all - Get all test cases
router.get('/:id/testcases/all', asyncHandler(async (req, res) => {
  const testCases = await TestCase.find({ problemId: req.params.id });
  res.json({ success: true, data: testCases });
}));

// DELETE /api/admin/problems/:id - Delete problem
router.delete('/:id', asyncHandler(async (req, res) => {
  await Problem.findByIdAndDelete(req.params.id);
  await TestCase.deleteMany({ problemId: req.params.id });
  res.json({ success: true, message: 'Problem deleted' });
}));

module.exports = router;
