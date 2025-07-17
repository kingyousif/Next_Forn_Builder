const mongoose = require("mongoose");

const SeminarSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    seminarTitle: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: Date, required: true },
    fromTime: { type: String, required: true }, // Format: "HH:MM"
    toTime: { type: String, required: true }, // Format: "HH:MM"
    duration: { type: String, required: false }, // Calculated duration
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    attendees: [
      {
        username: String,
        fullName: String,
        department: String,
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    maxAttendees: { type: Number, default: 5000 },
    location: { type: String, required: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
SeminarSchema.index({ date: 1, fromTime: 1 });
SeminarSchema.index({ username: 1 });

module.exports = mongoose.model("Seminar", SeminarSchema);
