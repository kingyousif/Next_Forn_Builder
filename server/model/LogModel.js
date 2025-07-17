const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // What action was performed (e.g., "create user", "delete form")
    module: { type: String, required: true }, // Which module/controller was used (e.g., "auth", "form")
    method: { type: String, required: true }, // Which method was called (e.g., "signup", "deleteForm")
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }, // Who performed the action
    userName: { type: String }, // Name of the user who performed the action
    userRole: { type: String }, // Role of the user who performed the action
    targetId: { type: String }, // ID of the affected resource (if applicable)
    details: { type: Object }, // Additional details about the action
    ipAddress: { type: String }, // IP address of the user
    userAgent: { type: String }, // User agent of the user's browser
    status: { type: String, enum: ["success", "failure"], default: "success" }, // Whether the action succeeded or failed
    errorMessage: { type: String }, // Error message if the action failed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
