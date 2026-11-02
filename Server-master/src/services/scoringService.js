const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');

/**
 * Score a quiz submission and persist the result.
 * Scoring is all-or-nothing per question — the student must select
 * exactly all correct option indices and no incorrect ones.
 */
const submitQuiz = async (quizId, userId, answers, timeTaken, userRole = 'student', mode = 'test') => {
  const query = { _id: quizId };
  // Admins can test unpublished quizzes; students must only take published ones.
  if (userRole !== 'admin') {
    query.isPublished = true;
  }
  
  const quiz = await Quiz.findOne(query);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.status = 404;
    throw err;
  }

  const questions = await Question.find({ _id: { $in: quiz.questions } });
  
  // Create an ordered list to match quiz.questions order
  const orderedQuestions = quiz.questions.map(id => 
    questions.find(q => q._id.toString() === id.toString())
  ).filter(q => !!q);

  if (orderedQuestions.length === 0) {
    const err = new Error('Quiz has no questions selected');
    err.status = 400;
    throw err;
  }

  const configuredQuestionCount =
    Number.isInteger(quiz.questionCount) && quiz.questionCount > 0
      ? quiz.questionCount
      : orderedQuestions.length;

  if (configuredQuestionCount !== orderedQuestions.length) {
    const err = new Error(
      `Configured questionCount (${configuredQuestionCount}) and actual selected questions (${orderedQuestions.length}) are not same`
    );
    err.status = 400;
    throw err;
  }

  let score = 0;
  for (const answer of answers) {
    const question = orderedQuestions.find(
      (q) => q._id.toString() === String(answer.questionId)
    );
    if (!question) continue;

    const correctIndices = question.options
      .map((opt, idx) => (opt.isCorrect ? idx : -1))
      .filter((idx) => idx !== -1);

    const selected = answer.selectedOptions || [];
    const isCorrect =
      correctIndices.length === selected.length &&
      correctIndices.every((idx) => selected.includes(idx));

    if (isCorrect) score++;
  }

  const totalQuestions = orderedQuestions.length;
  const percentage = parseFloat(((score / totalQuestions) * 100).toFixed(2));
  const isPassed = percentage >= quiz.passingScore;

  const result = await QuizResult.create({
    userId,
    quizId,
    score,
    totalQuestions,
    percentage,
    isPassed,
    timeTaken,
    mode,
    answers: answers.map((a) => ({
      questionId: a.questionId,
      selectedOptions: a.selectedOptions || [],
    })),
  });

  return {
    _id: result._id,
    userId: result.userId,
    quizId: result.quizId,
    score: result.score,
    totalQuestions: result.totalQuestions,
    percentage: result.percentage,
    isPassed: result.isPassed,
    timeTaken: result.timeTaken,
    mode: result.mode,
    createdAt: result.createdAt,
  };
};

module.exports = { submitQuiz };
