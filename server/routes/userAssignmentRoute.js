const express = require("express");
const {
  createUserAssignment,
  fetchUserAssignments,
  fetchUserAssignmentById,
  fetchAssignmentsByEmployee,
  updateUserAssignment,
  deleteUserAssignment,
} = require("../controller/UserAssignmentController");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

// Public routes
router.post("/create", createUserAssignment);
router.post("/fetch", fetchUserAssignments);
router.post("/fetchByEmployee", fetchAssignmentsByEmployee);
router.get("/fetchById/:id", fetchUserAssignmentById);

// Protected routes (require authentication)
router.put("/update/:id", verifyToken, updateUserAssignment);
router.delete("/delete/:id", verifyToken, deleteUserAssignment);

module.exports = router;
