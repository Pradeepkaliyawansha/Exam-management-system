/**
 * Middleware to handle large header sizes with graceful fallbacks
 * This helps prevent 431 Request Header Fields Too Large errors
 */
const headerSizeHandler = (req, res, next) => {
  // Get combined header size
  const headers = req.headers;
  let headerSize = 0;

  // Calculate actual header size in bytes
  Object.entries(headers).forEach(([key, value]) => {
    headerSize += Buffer.byteLength(key + ": " + value + "\r\n");
  });

  // Log large header requests for monitoring
  if (headerSize > 8000) {
    console.warn(
      `Large header request (${headerSize} bytes) from ${req.ip} to ${req.path}`
    );
  }

  // Check if header size exceeds limit (16KB)
  if (headerSize > 16384) {
    console.warn(
      `Header size limit exceeded (${headerSize} bytes) from ${req.ip}`
    );

    // For student dashboard endpoints, return empty data to prevent errors
    if (
      req.path === "/api/student/exams" ||
      req.path === "/api/results/student" ||
      req.path === "/api/student/notifications"
    ) {
      console.log(
        "Returning empty array for dashboard endpoint due to header size"
      );
      return res.status(200).json([]);
    }

    // For other endpoints, return a 431 with helpful message
    return res.status(431).json({
      status: "error",
      message: "Request Header Fields Too Large",
      suggestion:
        "Try reducing authorization token size or simplifying request headers",
      headerSize: headerSize,
      maxSize: 16384,
    });
  }

  // Continue to next middleware if headers are within limits
  next();
};

module.exports = headerSizeHandler;
