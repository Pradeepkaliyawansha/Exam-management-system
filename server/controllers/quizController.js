const Quiz = require("../models/Quiz");
const Exam = require("../models/Exam");
const { validationResult } = require("express-validator");

// @route   GET api/admin/exams/:examId/quizzes
// @desc    Get all quizzes for an exam
// @access  Private/Admin
exports.getQuizzesByExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    const quizzes = await Quiz.find({ examId: req.params.examId })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/admin/quizzes/:id
// @desc    Get quiz by ID
// @access  Private/Admin
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("examId", "title")
      .populate("createdBy", "name");

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   POST api/admin/exams/:examId/quizzes
// @desc    Create a new quiz for an exam
// @access  Private/Admin
exports.createQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, questions, timeLimit } = req.body;

  try {
    // Check if exam exists
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Validate and format questions
    const formattedQuestions = questions.map((question, index) => {
      // Ensure each question has exactly 4 options
      if (!question.options || question.options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
      }

      // Ensure each option has the correct structure
      const formattedOptions = question.options.map((option) => ({
        text: option.text.trim(),
        isCorrect: Boolean(option.isCorrect),
      }));

      // Validate that exactly one option is correct
      const correctCount = formattedOptions.filter(
        (opt) => opt.isCorrect
      ).length;
      if (correctCount !== 1) {
        throw new Error(
          `Question ${index + 1} must have exactly one correct answer`
        );
      }

      return {
        question: question.question.trim(),
        options: formattedOptions,
        marks: Number(question.marks) || 1,
      };
    });

    // Create new quiz
    const newQuiz = new Quiz({
      examId: req.params.examId,
      title: title.trim(),
      description: description.trim(),
      questions: formattedQuestions,
      timeLimit: Number(timeLimit) || 10,
      createdBy: req.user.id,
    });

    const quiz = await newQuiz.save();

    // Update exam's quizzes array
    exam.quizzes.push(quiz._id);
    await exam.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    // Check if it's a validation error
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json({
        msg: "Validation failed",
        errors,
      });
    }
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @route   PUT api/admin/quizzes/:id
// @desc    Update a quiz
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, questions, timeLimit } = req.body;

  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Update fields
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.questions = questions || quiz.questions;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.updatedAt = Date.now();

    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   DELETE api/admin/quizzes/:id
// @desc    Delete a quiz
// @access  Private/Admin
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Remove quiz from exam's quizzes array
    const exam = await Exam.findById(quiz.examId);
    if (exam) {
      exam.quizzes = exam.quizzes.filter(
        (quizId) => quizId.toString() !== req.params.id
      );
      await exam.save();
    }

    // Use deleteOne() instead of remove()
    await quiz.deleteOne();

    res.json({ msg: "Quiz removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/admin/exams/:examId/quiz-summary
// @desc    Get quiz summary for an exam
// @access  Private/Admin
exports.getQuizSummary = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    const quizzes = await Quiz.find({ examId: req.params.examId });

    const summary = {
      totalQuizzes: quizzes.length,
      totalQuestions: quizzes.reduce(
        (total, quiz) => total + quiz.questions.length,
        0
      ),
      totalMarks: quizzes.reduce((total, quiz) => {
        return (
          total +
          quiz.questions.reduce((sum, question) => sum + question.marks, 0)
        );
      }, 0),
      averageTimeLimit:
        quizzes.reduce((total, quiz) => total + quiz.timeLimit, 0) /
        quizzes.length,
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
