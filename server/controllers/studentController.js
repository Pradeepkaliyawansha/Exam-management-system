const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Notification = require("../models/Notification");

// @route   GET api/student/exams
// @desc    Get available exams for logged in student
// @access  Private/Student
exports.getAvailableExams = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();

    // Find active exams that are today or in the future
    const exams = await Exam.find({
      isActive: true,
      date: { $gte: new Date(currentDate.setHours(0, 0, 0, 0)) },
    })
      .populate("coordinator", "name")
      .sort({ date: 1 });

    // Check if student has already taken the exam
    const results = await Result.find({ studentId: req.user.id });

    // Map exams with additional info
    const mappedExams = exams.map((exam) => {
      const takenResult = results.find(
        (result) => result.examId.toString() === exam._id.toString()
      );

      return {
        ...exam._doc,
        taken: !!takenResult,
        resultId: takenResult ? takenResult._id : null,
      };
    });

    res.json(mappedExams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/exams/:id
// @desc    Get exam details
// @access  Private/Student
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "coordinator",
      "name"
    );

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Check if exam is active
    if (!exam.isActive) {
      return res.status(403).json({ msg: "This exam is not active" });
    }

    // Check if student has already taken this exam
    const result = await Result.findOne({
      studentId: req.user.id,
      examId: req.params.id,
    });

    const quizzes = await Quiz.find({ examId: req.params.id }).select(
      "_id title description timeLimit"
    );

    res.json({
      exam,
      quizzes,
      taken: !!result,
      resultId: result ? result._id : null,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/quizzes/:id
// @desc    Get quiz by ID to take it
// @access  Private/Student
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "examId",
      "title date"
    );

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Check if the exam is active
    const exam = await Exam.findById(quiz.examId);
    if (!exam || !exam.isActive) {
      return res.status(403).json({ msg: "This exam is not active" });
    }

    // Remove correct answers from response
    const sanitizedQuiz = {
      ...quiz._doc,
      questions: quiz.questions.map((question) => ({
        ...question._doc,
        options: question.options.map((option) => ({
          _id: option._id,
          text: option.text,
        })),
      })),
    };

    res.json(sanitizedQuiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   POST api/student/quizzes/:id/submit
// @desc    Submit answers for a quiz
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  const { answers } = req.body;

  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      const selectedOption = question.options[answer.selectedOptionIndex];
      const isCorrect = selectedOption.isCorrect;

      if (isCorrect) {
        score += question.marks;
      }

      return {
        questionIndex: answer.questionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
      };
    });

    // Calculate total possible marks
    const totalPossible = quiz.questions.reduce(
      (total, question) => total + question.marks,
      0
    );

    // Check if result document exists for this student and exam
    let result = await Result.findOne({
      studentId: req.user.id,
      examId: quiz.examId,
    });

    if (!result) {
      // Create new result document
      result = new Result({
        studentId: req.user.id,
        examId: quiz.examId,
        quizResults: [
          {
            quizId: quiz._id,
            answers: gradedAnswers,
            score,
            totalPossible,
            completedAt: Date.now(),
          },
        ],
        totalScore: score,
        totalPossible,
      });
    } else {
      // Check if quiz already taken
      const quizIndex = result.quizResults.findIndex(
        (qr) => qr.quizId.toString() === quiz._id.toString()
      );

      if (quizIndex !== -1) {
        return res
          .status(400)
          .json({ msg: "You have already submitted this quiz" });
      }

      // Add new quiz result
      result.quizResults.push({
        quizId: quiz._id,
        answers: gradedAnswers,
        score,
        totalPossible,
        completedAt: Date.now(),
      });

      // Update total score
      result.totalScore += score;
      result.totalPossible += totalPossible;
    }

    await result.save();

    res.json({
      score,
      totalPossible,
      percentage: Math.round((score / totalPossible) * 100),
      resultId: result._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   POST api/student/results/:id/details
// @desc    Add additional details to result and generate PDF
// @access  Private/Student
exports.addResultDetails = async (req, res) => {
  const { additionalDetails } = req.body;

  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ msg: "Result not found" });
    }

    // Check if this result belongs to the current student
    if (result.studentId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Add additional details
    result.additionalDetails = additionalDetails;
    result.pdfGenerated = true;

    await result.save();

    res.json(result);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Result not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/results
// @desc    Get all results for logged in student
// @access  Private/Student
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate("examId", "title date")
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getNotifications = async (req, res) => {
  try {
    // Define a model check
    const hasNotificationModel = typeof Notification !== "undefined";

    // Return empty array if model doesn't exist
    if (!hasNotificationModel) {
      console.log("Notification model not defined, returning empty array");
      return res.json([]);
    }

    // Limit fields and results to reduce response size
    const notifications = await Notification.find(
      { userId: req.user.id },
      "message isRead createdAt type" // Only select needed fields
    )
      .sort({ createdAt: -1 })
      .limit(5); // Only return 5 most recent

    return res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    // Return empty array on error to prevent client issues
    return res.json([]);
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};
