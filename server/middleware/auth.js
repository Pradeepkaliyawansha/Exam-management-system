const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token =
    req.header("x-auth-token") ||
    req.header("Authorization")?.replace("Bearer ", "");

  // Check if no token
  if (!token) {
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
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({
      success: false,
      msg: "Token is not valid",
    });
  }
};
