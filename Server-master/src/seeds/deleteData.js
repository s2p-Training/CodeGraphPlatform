require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');
const Question = require('../models/Question');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');

async function deleteData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const qResult = await Question.deleteMany({});
    const cResult = await Chapter.deleteMany({});
    const quizResult = await Quiz.deleteMany({});

    console.log(`Successfully deleted ${qResult.deletedCount} questions.`);
    console.log(`Successfully deleted ${cResult.deletedCount} chapters.`);
    console.log(`Successfully deleted ${quizResult.deletedCount} quizzes.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Error during data deletion:', err.message);
    process.exit(1);
  }
}

deleteData();
