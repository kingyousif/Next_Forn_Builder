const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttendanceUserSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: Number, required: true },
    active: { type: Boolean, required: false },
  },
  {
    timestamps: true,
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("AttendanceUser", AttendanceUserSchema);
