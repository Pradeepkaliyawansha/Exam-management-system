// server/models/Quiz.js
const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [OptionSchema],
  marks: {
    type: Number,
    default: 1,
    required: true,
  },
});

// Pre-validate to ensure each question has exactly one correct answer
QuestionSchema.pre("validate", function (next) {
  const correctAnswers = this.options.filter((option) => option.isCorrect);
  if (correctAnswers.length !== 1) {
    next(new Error("Each question must have exactly one correct answer"));
  } else {
    next();
  }
});

const QuizSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: [QuestionSchema],
    validate: {
      validator: function (questions) {
        return questions && questions.length > 0;
      },
      message: "Quiz must have at least one question",
    },
  },
  timeLimit: {
    type: Number, // in minutes
    default: 5,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before updating
QuizSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model("Quiz", QuizSchema);
