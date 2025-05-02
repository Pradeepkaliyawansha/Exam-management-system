const Quiz = require("../models/Quiz");
const Exam = require("../models/Exam");

// @route   GET api/admin/exams/:examId/quizzes
// @desc    Get all quizzes for an exam
// @access  Private/Admin
exports.getQuizzesByExam = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ examId: req.params.examId })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
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
  const { title, description, questions, timeLimit } = req.body;

  try {
    // Check if exam exists
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Create new quiz
    const newQuiz = new Quiz({
      examId: req.params.examId,
      title,
      description,
      questions,
      timeLimit,
      createdBy: req.user.id,
    });

    const quiz = await newQuiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   PUT api/admin/quizzes/:id
// @desc    Update a quiz
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
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

    await quiz.remove();

    res.json({ msg: "Quiz removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};
