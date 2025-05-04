const User = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper function to generate JWT token with minimal payload
const generateToken = (user) => {
  try {
    // Minimal payload to reduce token size
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Use environment variable for JWT secret or fallback to a default
    const secret = process.env.JWT_SECRET || "exam_management_secret_token";

    // Set token expiration - 24 hours by default
    const expiresIn = process.env.JWT_EXPIRATION || "24h";

    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate authentication token");
  }
};

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "User already exists" }],
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // Will be hashed in the model's pre-save hook
      role: role || "student", // Default to student if not specified
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    if (err.name === "ValidationError") {
      // Mongoose validation error
      return res.status(400).json({
        success: false,
        errors: [{ msg: err.message }],
      });
    }

    res.status(500).json({
      success: false,
      errors: [
        { msg: "Server error during registration", details: err.message },
      ],
    });
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  console.log("Login attempt received:", req.body.email);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check database connection by making a simple query
    try {
      await User.findOne();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({
        success: false,
        msg: "Database connection error",
        error: dbError.message,
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    console.log("User lookup result:", user ? "User found" : "User not found");

    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Invalid credentials" }],
      });
    }

    // Check password
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log(
        "Password comparison result:",
        isMatch ? "Match" : "No match"
      );
    } catch (pwError) {
      console.error("Password comparison error:", pwError);
      return res.status(500).json({
        success: false,
        msg: "Password verification error",
        error: pwError.message,
      });
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Invalid credentials" }],
      });
    }

    // Generate JWT token
    let token;
    try {
      token = generateToken(user);
      console.log("Token generated successfully");
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      return res.status(500).json({
        success: false,
        msg: "Authentication token generation failed",
        error: tokenError.message,
      });
    }

    // Log successful login
    console.log(`User logged in successfully: ${user.email} (${user.role})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error details:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      msg: "Server error during login",
      error: err.message,
    });
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    console.log("Getting current user for id:", req.user.id);

    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      console.log("User not found for id:", req.user.id);
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    console.log("Current user retrieved successfully:", user.email);
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// @route   GET api/auth/validate
// @desc    Validate token
// @access  Private
exports.validateToken = async (req, res) => {
  // If this route is reached, it means the token is valid (auth middleware passed)
  console.log("Token validated for user:", req.user.id);

  res.json({
    success: true,
    msg: "Token is valid",
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
};
