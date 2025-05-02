const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  answers: [
    {
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
      selectedOption: {
        type: Number,
      },
      isCorrect: {
        type: Boolean,
      },
    },
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  maxPossibleScore: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  additionalDetails: {
    type: Object,
  },
  feedback: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  pdfGenerated: {
    type: Boolean,
    default: false,
  },
  pdfUrl: {
    type: String,
  },
});

// Calculate score before saving
ResultSchema.pre("save", function (next) {
  if (this.answers && this.answers.length > 0) {
    const correctAnswers = this.answers.filter(
      (answer) => answer.isCorrect
    ).length;
    this.totalScore = correctAnswers;
    this.percentage = (this.totalScore / this.maxPossibleScore) * 100;
  }
  next();
});

module.exports = mongoose.model("Result", ResultSchema);
