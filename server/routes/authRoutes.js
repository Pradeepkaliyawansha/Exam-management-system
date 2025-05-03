const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Debug middleware for all routes
const debugRequest = (req, res, next) => {
  console.log(`📝 Auth request received for: ${req.path}`);
  console.log(`📊 Headers size: ${JSON.stringify(req.headers).length} bytes`);
  console.log(`📊 Body size: ${JSON.stringify(req.body).length} bytes`);
  console.log(`🔑 Body fields: ${Object.keys(req.body)}`);
  next();
};

// CORS preflight for all auth routes
router.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    debugRequest, // Add debug middleware
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, authController.getCurrentUser);

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  "/register",
  [
    debugRequest, // Add debug middleware
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("role", "Role must be either student or admin")
      .optional()
      .isIn(["student", "admin"]),
  ],
  authController.register
);

module.exports = router;
