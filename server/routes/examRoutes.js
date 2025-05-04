const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const examController = require("../controllers/examController");
const auth = require("../middleware/auth");
const { isAdmin, isStudent } = require("../middleware/roleCheck");

// @route   POST api/exams
// @desc    Create a new exam
// @access  Private (Admin only)
router.post(
  "/",
  [
    auth,
    isAdmin,
    [
      check("title").trim().notEmpty().withMessage("Title is required"),
      check("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),
      check("date").isISO8601().withMessage("Valid date is required"),
      check("duration")
        .isInt({ min: 1 })
        .withMessage("Duration must be positive"),
      check("maxStudents")
        .isInt({ min: 1 })
        .withMessage("Max students must be positive"),
      check("specialRequirements").optional().trim(),
      check("coordinator").optional().isString(),
    ],
  ],
  examController.createExam
);

// @route   GET api/exams
// @desc    Get all exams
// @access  Private
router.get("/", auth, examController.getAllExams);

// @route   GET api/exams/active
// @desc    Get active exams
// @access  Private (Student)
router.get("/active", [auth, isStudent], examController.getActiveExams);

// @route   GET api/exams/:id
// @desc    Get exam by ID
// @access  Private
router.get("/:id", auth, examController.getExamById);

// @route   PUT api/exams/:id
// @desc    Update an exam
// @access  Private (Admin only)
router.put(
  "/:id",
  [
    auth,
    isAdmin,
    [
      check("title", "Title is required").optional(),
      check("description", "Description is required").optional(),
      check("date", "Date is required").optional(),
      check("duration", "Duration is required").optional().isNumeric(),
      check("maxStudents", "Maximum number of students is required")
        .optional()
        .isNumeric(),
    ],
  ],
  examController.updateExam
);

// @route   DELETE api/exams/:id
// @desc    Delete an exam
// @access  Private (Admin only)
router.delete("/:id", [auth, isAdmin], examController.deleteExam);

// @route   POST api/exams/:id/start
// @desc    Start taking an exam
// @access  Private (Student only)
router.post("/:id/start", [auth, isStudent], examController.startExam);

// @route   POST api/exams/:id/submit
// @desc    Submit an exam
// @access  Private (Student only)
router.post(
  "/:id/submit",
  [
    auth,
    isStudent,
    [
      check("answers", "Answers are required").isArray(),
      check("answers.*.quizId", "Quiz ID is required for each answer")
        .not()
        .isEmpty(),
      check(
        "answers.*.selectedOption",
        "Selected option is required for each answer"
      ).isNumeric(),
    ],
  ],
  examController.submitExam
);

module.exports = router;
