const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    user_name: { type: String, required: true },
    timestamp: { type: Date, required: true, unique: true },
    status: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("Attendance", AttendanceSchema);
