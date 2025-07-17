const express = require("express");
const { logMiddleware } = require("../utils/loggingService");
const {
  createDepartment,
  fetchDepartment,
} = require("../controller/DepartmentController");

const router = express.Router();

// Apply logging middleware to routes
router.post(
  "/",
  logMiddleware(
    "department",
    "createDepartment",
    "Create department evaluation"
  ),
  createDepartment
);

router.get(
  "/",
  logMiddleware(
    "department",
    "fetchDepartment",
    "Fetch all department evaluations"
  ),
  fetchDepartment
);

module.exports = router;
