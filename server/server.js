const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

// Initialize express
const app = express();
require("dotenv").config();

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Serve static files (for PDF downloads)
app.use("/pdfs", express.static(path.join(__dirname, "public/pdfs")));

// Define Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/results", require("./routes//resultRoutes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // For testing purposes
