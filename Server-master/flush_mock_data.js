require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./src/config/env');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Chapter = require('./src/models/Chapter');
const Quiz = require('./src/models/Quiz');
const QuizResult = require('./src/models/QuizResult');

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Create a Student
    const studentEmail = 'mock@student.com';
    const hashedPassword = await bcrypt.hash('password123', 10);
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Mock Pro Learner',
        email: studentEmail,
        password: hashedPassword,
        role: 'student'
      });
      console.log('Mock student created');
    }

    // 2. Create a Course
    const course = await Course.create({
      title: 'Advanced React Mastery',
      description: 'Master React by building complex applications with modern hooks and design patterns.',
      isPublished: true
    });
    console.log('Course created');

    // 3. Create Chapters
    const ch1 = await Chapter.create({
      courseId: course._id,
      title: 'Modern Architecture',
      description: 'Design patterns for React apps.',
      order: 1
    });
    
    const ch2 = await Chapter.create({
      courseId: course._id,
      title: 'Custom Hooks & State',
      description: 'Advanced state management.',
      order: 2
    });

    // 4. Create Quizzes
    const q1 = await Quiz.create({
      chapterId: ch1._id,
      courseId: course._id,
      title: 'Architecture Fundamentals',
      description: 'Test your architecture knowledge.',
      questionCount: 5,
      passingScore: 70,
      timeLimit: 10,
      isPublished: true
    });

    const q2 = await Quiz.create({
      chapterId: ch2._id,
      courseId: course._id,
      title: 'Custom Hooks Quiz',
      description: 'Master the use of custom hooks.',
      questionCount: 5,
      passingScore: 70,
      timeLimit: 10,
      isPublished: true
    });

    // 5. Create Quiz Results (To simulate activity)
    // Important: Dates must be in YYYY-MM-DD format or similar
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(); dayBefore.setDate(today.getDate() - 2);
    const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7);
    const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(today.getMonth() - 1);

    const resultsData = [
      { quizId: q1._id, score: 5, totalQuestions: 5, percentage: 100, isPassed: true, timeTaken: 300, createdAt: today },
      { quizId: q2._id, score: 4, totalQuestions: 5, percentage: 80, isPassed: true, timeTaken: 400, createdAt: yesterday },
      { quizId: q1._id, score: 3, totalQuestions: 5, percentage: 60, isPassed: false, timeTaken: 500, createdAt: dayBefore },
      { quizId: q2._id, score: 5, totalQuestions: 5, percentage: 100, isPassed: true, timeTaken: 250, createdAt: weekAgo },
      { quizId: q1._id, score: 4, totalQuestions: 5, percentage: 80, isPassed: true, timeTaken: 320, createdAt: twoMonthsAgo },
    ];

    for (const r of resultsData) {
      const res = await QuizResult.create({
        ...r,
        userId: student._id
      });
      // Force update the timestamps because mongoose might override them on create
      await QuizResult.updateOne({ _id: res._id }, { createdAt: r.createdAt });
    }

    console.log('Results flushed! You can now log in with:');
    console.log('Email: mock@student.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
