const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const { validationResult } = require("express-validator");

// @route   POST api/exams
// @desc    Create a new exam
// @access  Private (Admin only)
exports.createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    date,
    duration,
    specialRequirements,
    maxStudents,
    coordinator,
  } = req.body;

  try {
    // Log exam creation attempt
    console.log("Creating exam with user:", req.user.id);
    console.log("Exam data:", { title, date, duration, maxStudents });

    const newExam = new Exam({
      title,
      description,
      date,
      duration,
      specialRequirements,
      maxStudents,
      coordinator,
      createdBy: req.user.id,
    });

    // Save with error handling
    const exam = await newExam.save();
    console.log("Exam created successfully:", exam._id);

    res.json(exam);
  } catch (err) {
    console.error("Error creating exam:", err.message);
    console.error("Error stack:", err.stack);

    // Handle specific errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        msg: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      msg: "Server error while creating exam",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @route   GET api/exams
// @desc    Get all exams
// @access  Private
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/exams/active
// @desc    Get active exams
// @access  Private (Student)
exports.getActiveExams = async (req, res) => {
  try {
    const currentDate = new Date();
    const exams = await Exam.find({
      isActive: true,
      date: { $gte: currentDate },
    }).sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/exams/:id
// @desc    Get exam by ID
// @access  Private
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "quizzes",
      "title question options points"
    );

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   PUT api/exams/:id
// @desc    Update an exam
// @access  Private (Admin only)
exports.updateExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    date,
    duration,
    specialRequirements,
    maxStudents,
    coordinator,
    isActive,
  } = req.body;

  // Build exam object
  const examFields = {};
  if (title) examFields.title = title;
  if (description) examFields.description = description;
  if (date) examFields.date = date;
  if (duration) examFields.duration = duration;
  if (specialRequirements) examFields.specialRequirements = specialRequirements;
  if (maxStudents) examFields.maxStudents = maxStudents;
  if (coordinator) examFields.coordinator = coordinator;
  if (isActive !== undefined) examFields.isActive = isActive;

  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Make sure user created the exam or is an admin
    if (
      exam.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: examFields },
      { new: true }
    );

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   DELETE api/exams/:id
// @desc    Delete an exam
// @access  Private (Admin only)
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Make sure user created the exam or is an admin
    if (
      exam.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Delete all quizzes associated with this exam
    await Quiz.deleteMany({ exam: req.params.id });

    // Delete all results associated with this exam
    await Result.deleteMany({ exam: req.params.id });

    // Delete the exam
    await exam.remove();

    res.json({ msg: "Exam removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   POST api/exams/:id/start
// @desc    Start taking an exam
// @access  Private (Student only)
exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("quizzes");

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Check if exam is active
    if (!exam.isActive) {
      return res.status(400).json({ msg: "This exam is not active" });
    }

    // Check if exam date is valid
    const currentDate = new Date();
    const examDate = new Date(exam.date);
    if (examDate > currentDate) {
      return res.status(400).json({ msg: "This exam is not available yet" });
    }

    // Check if user already started this exam
    const existingResult = await Result.findOne({
      student: req.user.id,
      exam: req.params.id,
    });

    if (existingResult && existingResult.completed) {
      return res
        .status(400)
        .json({ msg: "You have already completed this exam" });
    }

    if (existingResult) {
      // Return existing result if exam was started but not completed
      return res.json(existingResult);
    }

    // Create a new result entry
    const newResult = new Result({
      student: req.user.id,
      exam: req.params.id,
      maxPossibleScore: exam.quizzes.length,
      startTime: Date.now(),
    });

    const result = await newResult.save();

    // Return only necessary quiz data to the student
    const safeQuizzes = exam.quizzes.map((quiz) => {
      return {
        _id: quiz._id,
        title: quiz.title,
        question: quiz.question,
        options: quiz.options,
        points: quiz.points,
      };
    });

    res.json({
      result,
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        quizzes: safeQuizzes,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   POST api/exams/:id/submit
// @desc    Submit an exam
// @access  Private (Student only)
exports.submitExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { answers, additionalDetails } = req.body;

  try {
    // Get the result entry
    let result = await Result.findOne({
      student: req.user.id,
      exam: req.params.id,
      completed: false,
    });

    if (!result) {
      return res
        .status(404)
        .json({ msg: "Exam session not found or already completed" });
    }

    // Check if time limit is exceeded
    const exam = await Exam.findById(req.params.id);
    const startTime = new Date(result.startTime);
    const currentTime = new Date();
    const timeDiffMinutes = (currentTime - startTime) / 60000; // Convert to minutes

    if (timeDiffMinutes > exam.duration) {
      return res.status(400).json({ msg: "Time limit exceeded" });
    }

    // Process answers
    const processedAnswers = [];

    for (const answer of answers) {
      const quiz = await Quiz.findById(answer.quizId);

      if (!quiz) {
        continue;
      }

      const isCorrect = answer.selectedOption === quiz.correctAnswer;

      processedAnswers.push({
        quiz: quiz._id,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    }

    // Update result
    result.answers = processedAnswers;
    result.endTime = currentTime;
    result.completed = true;
    result.additionalDetails = additionalDetails || {};

    await result.save();

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
