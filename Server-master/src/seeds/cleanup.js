require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import Models
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Problem = require('../models/Problem');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const TestCase = require('../models/TestCase');
const Tag = require('../models/Tag');

const cleanup = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for cleanup...');

    const collections = [
      { name: 'Courses', model: Course },
      { name: 'Chapters', model: Chapter },
      { name: 'Problems', model: Problem },
      { name: 'Quizzes', model: Quiz },
      { name: 'Questions', model: Question },
      { name: 'QuizResults', model: QuizResult },
      { name: 'TestCases', model: TestCase },
      { name: 'Tags', model: Tag },
    ];

    console.log('\n--- Starting Cleanup ---');
    
    for (const col of collections) {
      const count = await col.model.countDocuments();
      await col.model.deleteMany({});
      console.log(`✓ Deleted ${count} ${col.name}`);
    }

    console.log('\n--- Cleanup Finished ---');
    console.log('Database is now fresh and ready for new curriculum.');
    
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
