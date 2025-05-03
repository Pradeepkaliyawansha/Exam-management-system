const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
  console.error("Error middleware caught:", err);
  console.error("Error stack:", err.stack);
  console.error("Request path:", req.path);
  console.error("Request method:", req.method);

  // Get error details
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";
  let errorDetails = process.env.NODE_ENV === "development" ? err.stack : null;

  // Handle specific error types
  switch (err.name) {
    case "ValidationError": // Mongoose validation error
      statusCode = 400;
      const errors = Object.values(err.errors).map((error) => error.message);
      message = `Validation Error: ${errors.join(", ")}`;
      break;

    case "CastError": // Mongoose bad ObjectId
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
      break;

    case "MongoServerError":
      if (err.code === 11000) {
        // Duplicate key error
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value entered for ${field} field`;
      }
      break;

    case "JsonWebTokenError":
      statusCode = 401;
      message = "Invalid token. Please log in again";
      break;

    case "TokenExpiredError":
      statusCode = 401;
      message = "Your token has expired. Please log in again";
      break;
  }

  // Add error identifier for tracking
  const errorId = Date.now().toString();
  console.error(`Error ID: ${errorId}`);

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      errorId,
      details: errorDetails,
    },
  });
};

module.exports = errorHandler;
