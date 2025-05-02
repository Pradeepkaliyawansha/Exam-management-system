const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

// Initialize express
const app = express();
require("dotenv").config();

// Increase header limit to fix 431 errors
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to Database
connectDB();

// Init Middleware
app.use(
  cors({
    // Allow cookies to be sent with requests
    credentials: true,
    // Specify domains that can access your API
    origin: ["http://localhost:3000"],
  })
);

// Create uploads directories if they don't exist
const fs = require("fs");
const uploadDirs = ["./public", "./public/pdfs"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files (for PDF downloads)
app.use("/pdfs", express.static(path.join(__dirname, "public/pdfs")));

// Define Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Handle 404 errors for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // For testing purposes
