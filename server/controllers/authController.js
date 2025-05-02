const User = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Use environment variable for JWT secret or fallback to a default
    const secret = process.env.JWT_SECRET || "exam_management_secret_token";
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

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
    console.error("Registration error:", err);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Invalid credentials" }],
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Invalid credentials" }],
      });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Use environment variable for JWT secret or fallback to a default
    const secret = process.env.JWT_SECRET || "exam_management_secret_token";
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

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
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during login",
    });
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
