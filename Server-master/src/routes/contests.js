const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const ContestResult = require("../models/ContestResult");
const Question = require("../models/Question");
const Problem = require("../models/Problem");
const TestCase = require("../models/TestCase");
const { authenticate } = require("../middleware/auth");

const JAVA_JUDGE_URL = "http://localhost:8080";

// Helper to poll Java server for submission status
const pollSubmission = async (submissionId, maxAttempts = 40) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const resp = await fetch(`${JAVA_JUDGE_URL}/submit/${submissionId}`);
      if (!resp.ok) continue;

      const json = await resp.json();
      const submission = json.data;

      if (submission.status !== "PENDING") {
        return submission;
      }
    } catch (err) {
      console.error(`Polling error for ${submissionId}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 500)); // Poll every 500ms
  }
  return { status: "TIMEOUT", score: 0 };
};

// @desc    Get contest details
// @route   GET /api/contests/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("mcqQuestions")
      .populate("codingProblems");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Submit contest answers (with Smart Auditor)
// @route   POST /api/contests/:id/submit
router.post("/:id/submit", authenticate, async (req, res) => {
  try {
    const { answers, codingSubmissions, finalCodes, violations, startTime } =
      req.body;
    const contestId = req.params.id;
    const userId = req.user._id;

    const contest =
      await Contest.findById(contestId).populate("codingProblems");
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    // 1. MCQ Audit
    let mcqScore = 0;
    const questionIds = Object.keys(answers || {});
    const dbQuestions = await Question.find({ _id: { $in: questionIds } });

    const mcqResults = Object.entries(answers || {}).map(
      ([qid, selectedIdx]) => {
        const question = dbQuestions.find((q) => q._id.toString() === qid);
        if (!question)
          return {
            questionId: qid,
            selectedOption: selectedIdx,
            isCorrect: false,
          };
        const correctIdx = question.options.findIndex((opt) => opt.isCorrect);
        const isCorrect = String(selectedIdx) === String(correctIdx);
        if (isCorrect) mcqScore += 10;
        return { questionId: qid, selectedOption: selectedIdx, isCorrect };
      },
    );

    // 2. Coding Audit (Discovery Phase)
    const codingResults = [];
    const autoJudgePromises = [];

    // Map existing submissions for easy lookup
    const manualSubsMap = new Map();
    (codingSubmissions || []).forEach((sub) =>
      manualSubsMap.set(sub.problemId, sub),
    );

    for (const problem of contest.codingProblems) {
      const probId = (problem._id || problem.id).toString();
      let manualSub = manualSubsMap.get(probId);

      if (manualSub) {
        // If the manual sub is missing basic metrics, fetch them from the judge
        if (
          manualSub.passedTestCases === undefined ||
          manualSub.totalTestCases === undefined
        ) {
          const detailedSub = await pollSubmission(manualSub.submissionId, 1);
          if (detailedSub && detailedSub.status !== "TIMEOUT") {
            manualSub = { ...manualSub, ...detailedSub };
          }
        }

        // Determine correct metrics (supporting both naming conventions for safety)
        const passed =
          manualSub.passedTestCases ??
          manualSub.testCasesPassed ??
          (manualSub.results?.filter((r) => r.passed).length || 0);
        const total =
          manualSub.totalTestCases ?? (manualSub.results?.length || 0);

        codingResults.push({
          problemId: probId,
          submissionId: manualSub.submissionId,
          status: manualSub.status,
          score:
            manualSub.status === "ACCEPTED" ||
            manualSub.status === "Solved" ||
            passed === total
              ? problem.points || 100
              : 0,
          executionTimeMs: manualSub.executionTimeMs || manualSub.timeMs,
          memoryKb: manualSub.memoryKb || manualSub.memoryUsageKb,
          testCasesPassed: passed,
          totalTestCases: total,
        });
      } else if (finalCodes && finalCodes[probId]) {
        // Late Discovery: Problem has code but no submission. Auto-Judge it.
        const testCases = await TestCase.find({ problemId: probId });

        const lateSubPromise = (async () => {
          try {
            const submitResp = await fetch(`${JAVA_JUDGE_URL}/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                problemId: problem.springProblemId,
                sourceCode: finalCodes[probId],
                driverCode: problem.driverCode,
                testCases: testCases.map((tc) => ({
                  input: tc.input,
                  expectedOutput: tc.expectedOutput,
                })),
              }),
            });

            if (!submitResp.ok) throw new Error("Java trigger failed");
            const submitJson = await submitResp.json();
            const submissionId = submitJson.data.id;

            // Wait for it to finish
            const finalized = await pollSubmission(submissionId);
            return {
              problemId: probId,
              submissionId,
              status: finalized.status,
              score:
                finalized.status === "ACCEPTED" ? problem.points || 100 : 0,
              executionTimeMs: finalized.executionTimeMs,
              memoryKb: finalized.memoryUsageKb || finalized.memoryKb,
              testCasesPassed:
                finalized.results?.filter((r) => r.passed).length || 0,
              totalTestCases: finalized.results?.length || 0,
            };
          } catch (err) {
            console.error(
              `Auto-judge failed for problem ${probId}:`,
              err.message,
            );
            return { problemId: probId, status: "AUDIT_FAILED", score: 0 };
          }
        })();

        autoJudgePromises.push(lateSubPromise);
      } else {
        // Not attempted
        codingResults.push({
          problemId: probId,
          status: "NOT_ATTEMPTED",
          score: 0,
        });
      }
    }

    // Parallel Reconcilliation
    const lateResults = await Promise.all(autoJudgePromises);
    codingResults.push(...lateResults);

    // 3. Final Aggregation
    let codingScore = codingResults.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0,
    );
    const totalScore = mcqScore + codingScore;
    const startObj = startTime ? new Date(startTime) : new Date();
    const endObj = new Date();
    const durationSeconds = Math.floor((endObj - startObj) / 1000);

    const totalQuestions =
      (contest.mcqQuestions?.length || 0) +
      (contest.codingProblems?.length || 0);
    const correctItems = mcqScore / 10 + codingScore / 100;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctItems / totalQuestions) * 100)
        : 0;

    const totalAllowedSeconds = (contest.duration || 60) * 60;

    // Efficiency logic: Time efficiency scaled by accuracy
    // If they solved nothing, efficiency is 0.
    // If they solved something, efficiency is (time saved) * (accuracy)
    let efficiency = 0;
    if (totalScore > 0 && totalAllowedSeconds > 0) {
      const timeEfficiency = Math.max(
        0,
        1 - durationSeconds / totalAllowedSeconds,
      );
      efficiency = Math.round(timeEfficiency * accuracy);
    }

    const result = await ContestResult.findOneAndUpdate(
      { userId, contestId },
      {
        mcqAnswers: mcqResults,
        codingAnswers: codingResults,
        violations: (violations || []).map((v) => ({
          type: v.type,
          timestamp: v.timestamp,
          metadata: v.metadata,
        })),
        startTime: startObj,
        endTime: endObj,
        durationSeconds,
        mcqPartialScore: mcqScore,
        codingPartialScore: codingScore,
        totalScore,
        accuracy,
        efficiency,
      },
      { upsert: true, new: true },
    );

    res.json(result);
  } catch (err) {
    console.error("Contest audit error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
