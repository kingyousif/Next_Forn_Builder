const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    token: { type: String, required: false },
    // verificationToken: String,
    // verificationTokenExpiresAt: Date,
    lastLogin: { type: Date, default: Date.now, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
