const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving - with improved error handling
UserSchema.pre("save", async function (next) {
  try {
    // Only hash password if it's modified (or new)
    if (!this.isModified("password")) {
      return next();
    }

    console.log("Hashing password for user:", this.email);

    // Generate salt with appropriate rounds
    const salt = await bcrypt.genSalt(10);

    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (err) {
    console.error("Password hashing error:", err);
    next(err);
  }
});

// Method to compare password - with improved error handling
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing password for user:", this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Password comparison error:", error);
    throw new Error("Password verification failed");
  }
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function () {
  try {
    const payload = {
      id: this._id,
      role: this.role,
    };

    // Use environment variable for JWT secret or fallback to default
    const secret = process.env.JWT_SECRET || "exam_management_secret_token";
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate authentication token");
  }
};

// Add a toJSON method to remove sensitive data when converting to JSON
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", UserSchema);
