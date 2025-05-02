const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const quizController = require("../controllers/quizController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");

// @route   POST api/quizzes
// @desc    Create a new quiz
// @access  Private (Admin only)
router.post(
  "/",
  [
    auth,
    isAdmin,
    [
      check("title", "Title is required").not().isEmpty(),
      check("question", "Question is required").not().isEmpty(),
      check("options", "Options are required").isArray({ min: 2 }),
      check("correctAnswer", "Correct answer is required").isNumeric(),
      check("examId", "Exam ID is required").not().isEmpty(),
    ],
  ],
  quizController.createQuiz
);

// @route   GET api/quizzes/exam/:examId
// @desc    Get all quizzes for an exam
// @access  Private (Admin only)
router.get("/exam/:examId", [auth, isAdmin], quizController.getQuizzesByExam);

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private (Admin only)
router.get("/:id", [auth, isAdmin], quizController.getQuizById);

// @route   PUT api/quizzes/:id
// @desc    Update a quiz
// @access  Private (Admin only)
router.put(
  "/:id",
  [
    auth,
    isAdmin,
    [
      check("title", "Title is required").optional(),
      check("question", "Question is required").optional(),
      check("options", "Options are required").optional().isArray({ min: 2 }),
      check("correctAnswer", "Correct answer is required")
        .optional()
        .isNumeric(),
    ],
  ],
  quizController.updateQuiz
);

// @route   DELETE api/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Admin only)
router.delete("/:id", [auth, isAdmin], quizController.deleteQuiz);

module.exports = router;
