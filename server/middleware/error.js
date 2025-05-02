const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
  console.error("Error middleware caught:", err);
  console.error(err.stack);

  // Default error status and message
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((error) => error.message);
    message = `Validation Error: ${errors.join(", ")}`;
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value entered";

    // Try to extract the field name from the error message
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`;
    }
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
