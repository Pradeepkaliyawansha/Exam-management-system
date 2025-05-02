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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
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

// Method to generate JWT
UserSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    role: this.role,
  };

  // Use environment variable for JWT secret or fallback to default
  const secret = process.env.JWT_SECRET || "exam_management_secret_token";
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

module.exports = mongoose.model("User", UserSchema);
