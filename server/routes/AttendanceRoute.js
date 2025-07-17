const express = require("express");
const {
  createAttendance,
  fetchAttendance,
  getStudentById,
  deleteStudent,
  bulkDeleteAttendance,
  editAttendance,
} = require("../controller/Attendance.Controller");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken.js");

// Create route - handles bulk creation
router.post("/create", createAttendance);

// Get all Attendance with pagination
router.get("/fetch", fetchAttendance);

// Edit route - handles updating a student by ID
router.put("/edit/:id", verifyToken, editAttendance); // Make sure 'editStudent' exists

// Get a specific student by ID
router.get("/:id", getStudentById);

// Delete a student by ID - this line is likely causing your error
router.delete("/:id", deleteStudent); // Make sure 'deleteStudent' exists

// Optional: Add bulk delete route
router.post("/bulk-delete", bulkDeleteAttendance); // If you added this method

module.exports = router;
