const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  specialRequirements: {
    type: String,
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  quizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
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
ExamSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model("Exam", ExamSchema);
