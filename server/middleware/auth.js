const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  // Check both Authorization formats: "Bearer token" and "x-auth-token"
  const bearerHeader = req.header("Authorization");
  const xAuthToken = req.header("x-auth-token");

  let token = null;

  if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
    token = bearerHeader.split(" ")[1];
  } else if (xAuthToken) {
    token = xAuthToken;
  }

  // Check if no token
  if (!token) {
    console.log("❌ No auth token provided in request");
    return res.status(401).json({
      success: false,
      msg: "No token, authorization denied",
    });
  }

  try {
    // Get the JWT secret from environment variables or use default
    const jwtSecret = process.env.JWT_SECRET || "exam_management_secret_token";

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user from payload to request object
    req.user = decoded;
    console.log(
      `✅ Authenticated user: ${req.user.id}, role: ${req.user.role}`
    );
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({
      success: false,
      msg: "Token is not valid",
    });
  }
};
