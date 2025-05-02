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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
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
