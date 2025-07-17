const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const { getDashboardData } = require("../controller/dashboard.Controller.js");

const router = express.Router();

// Get all work sell requests
router.get("/get", verifyToken, getDashboardData);

module.exports = router;
