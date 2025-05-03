const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

// Initialize express
const app = express();
require("dotenv").config();

// Debug middleware to log request headers
app.use((req, res, next) => {
  console.log(`🔍 Request to: ${req.method} ${req.path}`);
  console.log(`📏 Header size: ${JSON.stringify(req.headers).length} bytes`);
  next();
});

// Increase limits for requests
app.use(
  express.json({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);

// Configure CORS with larger header limits
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    exposedHeaders: ["Content-Length", "x-auth-token", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    maxAge: 86400, // 24 hours in seconds
  })
);

// Set header size limits
app.use((req, res, next) => {
  // Increase header size
  req.connection.setMaxHeadersCount(100);
  next();
});

// Connect to Database
connectDB();

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

// API health check to test the server is running
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

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // For testing purposes
