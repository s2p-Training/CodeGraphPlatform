const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Question = require('../src/models/Question');
const Quiz = require('../src/models/Quiz');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://root:root@quizdb.okp9bs9.mongodb.net/?appName=QuizDB');
    console.log('Connected successfully!');

    // 1. Get all questions that don't have a chapterId
    const orphanedQuestions = await Question.find({ chapterId: { $exists: false } });
    console.log(`Found ${orphanedQuestions.length} questions to migrate.`);

    for (const question of orphanedQuestions) {
      if (!question.quizId) continue;

      // Find the quiz this question was originally attached to
      const quiz = await Quiz.findById(question.quizId);
      if (quiz) {
        // Update the question with chapter and course info from the quiz
        question.chapterId = quiz.chapterId;
        question.courseId = quiz.courseId;
        await question.save();

        // Also add this question to the quiz's internal 'questions' array if not already there
        if (!quiz.questions.includes(question._id)) {
          quiz.questions.push(question._id);
          await quiz.save();
        }
      }
    }

    // 2. Handle quizzes that already have questions but their internal list is empty
    const quizzes = await Quiz.find({ questions: { $size: 0 } });
    for (const quiz of quizzes) {
      const qIds = await Question.find({ quizId: quiz._id }).distinct('_id');
      if (qIds.length > 0) {
        quiz.questions = qIds;
        await quiz.save();
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
