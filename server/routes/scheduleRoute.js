const express = require("express");
const {
  createShift,
  getShifts,
  updateShift,
  deleteShift,
  setUserAvailability,
  getUserAvailability,
  createSchedule,
  createBatchSchedule,
  getSchedule,
  deleteSchedule,
  deleteUserAvailability,
  getUserAvailabilityById,
} = require("../controller/ScheduleController");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

// Shift routes
router.post("/shifts/create", verifyToken, createShift);
router.get("/shifts", verifyToken, getShifts);
router.put("/shifts/update", verifyToken, updateShift);
router.delete("/shifts/delete/:id", verifyToken, deleteShift);

// User availability routes
router.post("/availability/set", verifyToken, setUserAvailability);
router.post("/availability/get", verifyToken, getUserAvailability);
router.post("/availability/get-by-id", verifyToken, getUserAvailabilityById); // Get user availability by ID
router.delete("/availability/delete/:id", verifyToken, deleteUserAvailability); // Delete user availability by ID

// Schedule routes
router.post("/create", verifyToken, createSchedule);
router.post("/batch-create", verifyToken, createBatchSchedule);
router.post("/get", verifyToken, getSchedule);
router.delete("/delete", verifyToken, deleteSchedule);

module.exports = router;
