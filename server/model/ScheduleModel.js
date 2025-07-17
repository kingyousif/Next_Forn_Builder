const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for shifts (morning, afternoon, night)
const ShiftSchema = new Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    department: { type: String, required: true },
    createdBy: { type: String, required: true },
    employeeCount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Schema for user availability
const UserAvailabilitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    maxWorkDays: { type: Number, default: 30 },
    unavailableDates: [{ type: Date }],
    userName: { type: String, required: true },
    allowedShifts: [{ type: Schema.Types.ObjectId, ref: "Shift" }],
    isFridayOff: { type: Boolean, default: false },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

// Schema for schedule assignments
const ScheduleAssignmentSchema = new Schema(
  {
    date: { type: Date, required: true },
    assignments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
        shiftId: { type: Schema.Types.ObjectId, ref: "Shift", required: true },
        userName: { type: String, required: true },
      },
    ],
    department: { type: String, required: true },
  },
  { timestamps: true }
);

const Shift = mongoose.model("Shift", ShiftSchema);
const UserAvailability = mongoose.model(
  "UserAvailability",
  UserAvailabilitySchema
);
const ScheduleAssignment = mongoose.model(
  "ScheduleAssignment",
  ScheduleAssignmentSchema
);

module.exports = { Shift, UserAvailability, ScheduleAssignment };
