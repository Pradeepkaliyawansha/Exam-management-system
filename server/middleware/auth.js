const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Get the JWT secret from environment variables or use default
    const jwtSecret = process.env.JWT_SECRET || "exam_management_secret_token";

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user from payload
    req.user = decoded;

    // Fetch complete user info from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    req.userObj = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
