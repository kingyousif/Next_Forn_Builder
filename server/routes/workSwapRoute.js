const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const {
  createWorkSwap,
  getAllWorkSwaps,
  getWorkSwapsByDepartment,
  getWorkSwapsByUser,
  updateWorkSwapStatus,
  deleteWorkSwap,
} = require("../controller/WorkSwapController.js");

const router = express.Router();

// Create a new work swap request
router.post("/create", verifyToken, createWorkSwap);

// Get all work swap requests
router.get("/all", verifyToken, getAllWorkSwaps);

// Get work swap requests by department
router.get("/department/:department", verifyToken, getWorkSwapsByDepartment);

// Get work swap requests by user
router.get("/user/:userName", verifyToken, getWorkSwapsByUser);

// Update work swap request status
router.put("/status/:id", verifyToken, updateWorkSwapStatus);

// Delete work swap request
router.delete("/delete/:id", verifyToken, deleteWorkSwap);

module.exports = router;
