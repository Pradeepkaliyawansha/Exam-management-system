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
  quizResults: [
    {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
      answers: [
        {
          questionIndex: Number,
          selectedOptionIndex: Number,
          isCorrect: Boolean,
          marks: Number,
        },
      ],
      score: Number,
      totalPossible: Number,
      completedAt: Date,
    },
  ],
  totalScore: {
    type: Number,
  },
  totalPossible: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  pdfGenerated: {
    type: Boolean,
    default: false,
  },
  additionalDetails: {
    type: Object, // For storing any additional details entered by student
  },
});

module.exports = mongoose.model("Result", ResultSchema);
