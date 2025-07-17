const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TimeManagementSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: [{ type: String, required: true }],
    userNames: [{ type: String, required: true }],
    workHoursPerDay: { type: Number, required: true },
    workDaysPerWeek: { type: Number, required: true },
    graceMinutesLate: { type: Number, required: true },
    graceMinutesEarly: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    notes: { type: String },
    // New fields for flexible scheduling
    scheduleType: {
      type: String,
      enum: ["standard", "flexible", "on-call"],
      default: "standard",
    },
    schedulePatterns: [
      {
        days: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 1=Monday, etc.
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Keep existing compound index
TimeManagementSchema.index({ userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("TimeManagement", TimeManagementSchema);
