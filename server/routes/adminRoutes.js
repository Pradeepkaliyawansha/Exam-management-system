const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const quizController = require("../controllers/quizController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Apply auth and admin role check middleware to all routes
router.use(auth, roleCheck("admin"));

// Exam routes
router.get("/exams", examController.getAllExams);
router.get("/exams/:id", examController.getExamById);
router.post("/exams", examController.createExam);
router.put("/exams/:id", examController.updateExam);
router.delete("/exams/:id", examController.deleteExam);

// Quiz routes will be added here

module.exports = router;

// Quiz routes
router.get("/exams/:examId/quizzes", quizController.getQuizzesByExam);
router.get("/quizzes/:id", quizController.getQuizById);
router.post("/exams/:examId/quizzes", quizController.createQuiz);
router.put("/quizzes/:id", quizController.updateQuiz);
router.delete("/quizzes/:id", quizController.deleteQuiz);
