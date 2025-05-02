const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const resultController = require("../controllers/resultsController");
const auth = require("../middleware/auth");
const { isAdmin, isStudent } = require("../middleware/roleCheck");

// @route   GET api/results/student
// @desc    Get all results for the current student
// @access  Private (Student only)
router.get("/student", [auth, isStudent], resultController.getStudentResults);

// @route   GET api/results/admin/exam/:examId
// @desc    Get all results for a specific exam
// @access  Private (Admin only)
router.get(
  "/admin/exam/:examId",
  [auth, isAdmin],
  resultController.getExamResults
);

// @route   GET api/results/:id
// @desc    Get result by ID
// @access  Private
router.get("/:id", auth, resultController.getResultById);

// @route   PUT api/results/:id/feedback
// @desc    Add feedback to a result
// @access  Private (Admin only)
router.put(
  "/:id/feedback",
  [auth, isAdmin, [check("feedback", "Feedback is required").not().isEmpty()]],
  resultController.addFeedback
);

// @route   POST api/results/:id/generate-pdf
// @desc    Generate PDF certificate for an exam result
// @access  Private
router.post("/:id/generate-pdf", auth, resultController.generatePDF);

module.exports = router;
