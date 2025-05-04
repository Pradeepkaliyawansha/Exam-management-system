const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const quizController = require("../controllers/quizController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");

// @route   POST api/admin/exams/:examId/quizzes
// @desc    Create a new quiz for an exam
// @access  Private/Admin
router.post(
  "/:examId/quizzes",
  [
    auth,
    isAdmin,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("questions", "Questions are required").isArray({ min: 1 }),
      check("questions.*.question", "Question text is required")
        .not()
        .isEmpty(),
      check("questions.*.options", "Options are required").isArray({ min: 4 }),
      check("questions.*.marks", "Marks are required").isInt({ min: 1 }),
      check("timeLimit", "Time limit is required").isInt({ min: 1 }),
    ],
  ],
  quizController.createQuiz
);

// @route   GET api/admin/exams/:examId/quizzes
// @desc    Get all quizzes for an exam
// @access  Private/Admin
router.get(
  "/:examId/quizzes",
  [auth, isAdmin],
  quizController.getQuizzesByExam
);

// @route   GET api/admin/quizzes/:id
// @desc    Get quiz by ID
// @access  Private/Admin
router.get("/:id", [auth, isAdmin], quizController.getQuizById);

// @route   PUT api/admin/quizzes/:id
// @desc    Update a quiz
// @access  Private/Admin
router.put(
  "/:id",
  [
    auth,
    isAdmin,
    [
      check("title", "Title is required").optional(),
      check("description", "Description is required").optional(),
      check("questions", "Questions are required")
        .optional()
        .isArray({ min: 1 }),
      check("timeLimit", "Time limit is required").optional().isInt({ min: 1 }),
    ],
  ],
  quizController.updateQuiz
);

// @route   DELETE api/admin/quizzes/:id
// @desc    Delete a quiz
// @access  Private/Admin
router.delete("/:id", [auth, isAdmin], quizController.deleteQuiz);

// @route   GET api/admin/exams/:examId/quiz-summary
// @desc    Get quiz summary for an exam
// @access  Private/Admin
router.get(
  "/:examId/quiz-summary",
  [auth, isAdmin],
  quizController.getQuizSummary
);

module.exports = router;
