const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const auth = require("../middleware/auth");
const { isStudent } = require("../middleware/roleCheck");

// Apply auth and student role check middleware to all routes
router.use(auth, isStudent);

// Exam routes
router.get("/exams", studentController.getAvailableExams);
router.get("/exams/:id", studentController.getExamById);

// Quiz routes
router.get("/quizzes/:id", studentController.getQuizById);
router.post("/quizzes/:id/submit", studentController.submitQuiz);

// Result routes
router.get("/results", studentController.getResults);
router.post("/results/:id/details", studentController.addResultDetails);

// Notification routes
router.get("/notifications", studentController.getNotifications);
router.put("/notifications/:id/read", studentController.markNotificationAsRead);
router.put(
  "/notifications/mark-all-read",
  studentController.markAllNotificationsAsRead
);
router.get("/timetable-pdf", studentController.downloadTimetablePDF);

module.exports = router;
