const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
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

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  // Handle JWT expired errors
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
