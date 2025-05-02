const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/exam-management";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
