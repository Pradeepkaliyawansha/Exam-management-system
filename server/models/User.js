const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving - fixing potential async issues
UserSchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered for user");

  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hashing");
    return next();
  }

  try {
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function () {
  const jwtSecret = process.env.JWT_SECRET || "exam_management_secret_token";
  const jwtExpiration = process.env.JWT_EXPIRE || "24h";

  return jwt.sign({ id: this._id, role: this.role }, jwtSecret, {
    expiresIn: jwtExpiration,
  });
};

module.exports = mongoose.model("User", UserSchema);
