const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

// Load environment variables
require("dotenv").config();

// Initialize express
const app = express();

// Add a middleware to handle large headers with increased limit
app.use((req, res, next) => {
  // Get combined header size
  const headers = req.headers;
  const headerSize = JSON.stringify(headers).length;

  // Increased header size limit to 16KB (from 8KB)
  if (headerSize > 16384) {
    console.warn(
      `Request with large headers (${headerSize} bytes) from ${req.ip}`
    );
    // Return 431 with helpful message
    return res.status(431).json({
      error: "Request Header Fields Too Large",
      message: "Please reduce the size of your request headers",
    });
  }
  next();
});

// Debug middleware to log request details
app.use((req, res, next) => {
  console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`🌐 Client IP: ${req.ip}`);
  console.log(`📏 Header size: ${JSON.stringify(req.headers).length} bytes`);
  next();
});

// Custom error handling for uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Configure CORS with more permissive limits
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours in seconds
  })
);

// Increase body parser limits
app.use(
  express.json({
    limit: "1mb", // Increased from 500kb
    extended: true,
  })
);
app.use(
  express.urlencoded({
    limit: "1mb", // Increased from 500kb
    extended: true,
    parameterLimit: 1000, // Increased from 500
  })
);

// Connect to Database - with error handling
console.log("Connecting to database...");
connectDB()
  .then(() => console.log("Database connection successful!"))
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

// Create uploads directories if they don't exist
const fs = require("fs");
const uploadDirs = ["./public", "./public/pdfs"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files (for PDF downloads)
app.use("/pdfs", express.static(path.join(__dirname, "public/pdfs")));

// Define Routes with better error handling for routes loading
try {
  console.log("Loading API routes...");

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/exams", require("./routes/examRoutes"));
  app.use("/api/quizzes", require("./routes/quizRoutes"));
  app.use("/api/results", require("./routes/resultRoutes"));
  app.use("/api/student", require("./routes/studentRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));

  console.log("API routes loaded successfully");
} catch (error) {
  console.error("Error loading API routes:", error);
  process.exit(1);
}

// API health check to test the server is running
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    databaseConnection:
      mongoose?.connection?.readyState === 1 ? "connected" : "disconnected",
  });
});

// Handle 404 errors for API routes
app.use("/api/*", (req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `⚡️ Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});

// Implement graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

module.exports = app; // For testing purposes
