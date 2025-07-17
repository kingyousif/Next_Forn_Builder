const express = require("express");
const {
  createAttendance,
  fetchAttendance,
  getStudentByIdAndChangeActive,
  deleteStudent,
  bulkDeleteAttendance,
} = require("../controller/AttendanceUser.Controller");
const router = express.Router();

// Create route - handles bulk creation
router.post("/create", createAttendance);

// Get all Attendance with pagination
router.post("/fetch", fetchAttendance);

// Get a specific student by ID
router.get("/:id", getStudentByIdAndChangeActive);

// Delete a student by ID - this line is likely causing your error
router.delete("/:id", deleteStudent); // Make sure 'deleteStudent' exists

// Optional: Add bulk delete route
router.post("/bulk-delete", bulkDeleteAttendance); // If you added this method

module.exports = router;
