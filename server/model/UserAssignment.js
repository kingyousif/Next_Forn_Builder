const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAssignment = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AttendanceUser",
    },
    userName: { type: String, required: true },
    employeeName: { type: String, required: true },
    userDepartment: { type: String, required: true },
    userRole: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("UserAssignment", UserAssignment);
