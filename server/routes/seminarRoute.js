const express = require("express");
const {
  createSeminar,
  fetchSeminars,
  fetchSeminarsByOrganizer,
  fetchUpcomingSeminars,
  registerForSeminar,
  updateSeminarStatus,
  deleteSeminar,
} = require("../controller/SeminarController");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

// Public routes
router.post("/create", createSeminar);
router.post("/fetch", fetchSeminars);
router.get("/upcoming", fetchUpcomingSeminars);
router.post("/fetchByOrganizer", fetchSeminarsByOrganizer);

// Registration routes
router.post("/register/:id", verifyToken, registerForSeminar);

// Protected routes (require authentication)
router.put("/updateStatus/:id", verifyToken, updateSeminarStatus);
router.delete("/delete/:id", verifyToken, deleteSeminar);

module.exports = router;
