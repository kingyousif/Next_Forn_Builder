const express = require("express");
const {
  createEmployeeProfile,
  fetchEmployeeProfiles,
  fetchEmployeeProfileById,
  updateEmployeeProfile,
  deleteEmployeeProfile,
  fetchEmployeeProfilesByDepartment,
  bulkDeleteEmployeeProfiles,
} = require("../controller/EmployeeProfileController");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

// Create employee profile
router.post("/create", verifyToken, createEmployeeProfile);

// Fetch all employee profiles (with role-based filtering)
router.post("/fetch", fetchEmployeeProfiles);

// Fetch employee profile by ID
router.get("/fetchById/:id", fetchEmployeeProfileById);

// Fetch employee profiles by department
router.post("/fetchByDepartment", fetchEmployeeProfilesByDepartment);

// Update employee profile
router.put("/update/:id", verifyToken, updateEmployeeProfile);

// Delete employee profile
router.delete("/delete/:id", verifyToken, deleteEmployeeProfile);

// Bulk delete employee profiles
router.delete("/bulkDelete", verifyToken, bulkDeleteEmployeeProfiles);

module.exports = router;
