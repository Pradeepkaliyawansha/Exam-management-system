const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "exam_added",
      "exam_updated",
      "result_available",
      "feedback_added",
      "success",
      "error",
      "warning",
      "exam",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Exam", "Result"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
