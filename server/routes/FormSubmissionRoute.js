const express = require("express");
const {
  createSubmission,
  getFormSubmissions,
  getUserSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
} = require("../controller/FormSubmission.Controller");
const router = express.Router();

// Create a new form submission
router.post("/", createSubmission);

// Get all submissions for a form
router.get("/form/:formId", getFormSubmissions);

// Get submissions by a specific user
router.get("/user/:userId", getUserSubmissions);

// Get a specific submission
router.get("/:id", getSubmission);

// Update a form submission
router.put("/:id", updateSubmission);

// Delete a form submission
router.delete("/:id", deleteSubmission);

module.exports = router;
