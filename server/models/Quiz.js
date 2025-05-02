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
  },
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
  questions: [QuestionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 5,
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
