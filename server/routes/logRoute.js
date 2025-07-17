const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const {
  getLogs,
  getUserLogs,
  getModuleLogs,
  deleteOldLogs,
} = require("../controller/LogController.js");

const router = express.Router();

// Get all logs with pagination and filtering
router.get("/all", verifyToken, getLogs);

// Get logs for a specific user
router.get("/user/:userId", verifyToken, getUserLogs);

// Get logs for a specific module
router.get("/module/:module", verifyToken, getModuleLogs);

// Delete logs older than a certain date
router.delete("/delete-old", verifyToken, deleteOldLogs);

module.exports = router;
