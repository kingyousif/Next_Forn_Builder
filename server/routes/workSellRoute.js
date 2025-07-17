const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const {
  createWorkSell,
  getAllWorkSells,
  getWorkSellsByDepartment,
  getWorkSellsByUser,
  updateWorkSellStatus,
  deleteWorkSell,
} = require("../controller/WorkSellController.js");

const router = express.Router();

// Create a new work sell request
router.post("/create", verifyToken, createWorkSell);

// Get all work sell requests
router.get("/all", verifyToken, getAllWorkSells);

// Get work sell requests by department
router.get("/department/:department", verifyToken, getWorkSellsByDepartment);

// Get work sell requests by user
router.get("/user/:userName", verifyToken, getWorkSellsByUser);

// Update work sell request status
router.put("/status/:id", verifyToken, updateWorkSellStatus);

// Delete work sell request
router.delete("/delete/:id", verifyToken, deleteWorkSell);

module.exports = router;
