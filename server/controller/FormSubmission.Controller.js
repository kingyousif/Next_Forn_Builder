// controllers/formSubmissionController.js
const FormSubmission = require("../model/formSubmissionModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const FormModel = require("../model/FormModel");
const userSchema = require("../model/user.model");
const { logAction } = require("../utils/loggingService");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper function to handle file uploads
const handleFileUploads = (req, res) => {
  return new Promise((resolve, reject) => {
    // Use multer to handle multipart form data
    const uploadFiles = upload.any();
    console.log("uploadFiles", uploadFiles);

    uploadFiles(req, res, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

// Create a new form submission

// Inside the createSubmission method
exports.createSubmission = async (req, res) => {
  try {
    // Handle file uploads if present
    await handleFileUploads(req, res);

    // Extract form data
    const { formId, userId, createdBy, createdFor, department, responses } =
      req.body;

    // Parse responses if it's sent as a string
    const parsedResponses =
      typeof responses === "string" ? JSON.parse(responses) : responses;

    // Process file uploads
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Find which form field this file belongs to
        const fieldName = file.fieldname;

        files.push({
          fieldName,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          path: file.path,
          size: file.size,
        });

        // Update the responses object to include file reference
        if (
          parsedResponses[fieldName] &&
          parsedResponses[fieldName] instanceof File
        ) {
          parsedResponses[fieldName] = {
            name: file.originalname,
            filename: file.filename,
            type: file.mimetype,
            size: file.size,
          };
        }
      });
    }

    // Calculate total score by summing numeric values, excluding name fields and dates
    let finalScore = 0;
    Object.keys(parsedResponses).forEach((key) => {
      if (
        key.toLowerCase().includes("name") ||
        key.includes("ناو") ||
        key.toLowerCase().includes("new name") ||
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("بەروار") ||
        parsedResponses[key] instanceof Date
      ) {
        return;
      }
      if (typeof parsedResponses[key] === "number") {
        finalScore += parsedResponses[key];
      } else if (typeof parsedResponses[key] === "string") {
        // Check if string contains a number
        const numberFromString = parseFloat(parsedResponses[key]);
        if (!isNaN(numberFromString)) {
          console.log("numberFromString", numberFromString);
          finalScore += numberFromString;
        }
      }
    });

    // calculate total percentage by summering values then dividing by forms percentage
    const form = await FormModel.findById(formId);
    const totalPercentage = finalScore / form.percentage;

    if (form.highestScore < finalScore) {
      return res.status(400).json({
        success: false,
        message: "Cannot score greater than highest score",
        error: "Cannot score greater than highest score",
      });
    }

    // Create new submission
    const newSubmission = new FormSubmission({
      formId,
      userId,
      createdBy,
      createdFor,
      department,
      responses: parsedResponses,
      files,
      totalScore: finalScore,
      totalPercentage: 0, // You can calculate this based on the form inf
      submittedAt: new Date(),
    });

    // Save to database
    await newSubmission.save();

    res.status(201).json({
      success: true,
      message: "Form submission created successfully",
      data: newSubmission,
    });
  } catch (error) {
    // Log failed submission
    await logAction(
      req,
      res,
      "formSubmission",
      "createSubmission",
      "Create form submission",
      "failure",
      error.message,
      { formId: req.body?.formId }
    );

    console.error("Error creating form submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create form submission",
      error: error.message,
    });
  }
};

// Get all submissions for a form
exports.getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;

    // Validate formId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    const submissions = await FormSubmission.find({ formId });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch form submissions",
      error: error.message,
    });
  }
};

// Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    // only show this form which the id equal to form._id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Form submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

// Get submissions by a specific user
exports.getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    let user = await userSchema.findById(userId);

    let submissions;
    // If user is superAdmin, retrieve all submissions
    if (user.role === "super admin") {
      submissions = await FormSubmission.find({});
    } else {
      // Otherwise only get submissions for specific user
      submissions = await FormSubmission.find({ userId });
    }

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user submissions",
      error: error.message,
    });
  }
};

// Update a form submission
exports.updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    // Handle file uploads if present
    await handleFileUploads(req, res);

    // Extract form data
    const { responses } = req.body;

    // Parse responses if it's sent as a string
    const parsedResponses =
      typeof responses === "string" ? JSON.parse(responses) : responses;

    // Find existing submission
    const existingSubmission = await FormSubmission.findById(id);

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: "Form submission not found",
      });
    }

    // Process file uploads
    const files = [...(existingSubmission.files || [])];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Find which form field this file belongs to
        const fieldName = file.fieldname;

        // Remove old file if it exists for this field
        const existingFileIndex = files.findIndex(
          (f) => f.fieldName === fieldName
        );
        if (existingFileIndex !== -1) {
          const oldFile = files[existingFileIndex];
          // Delete old file from filesystem
          if (fs.existsSync(oldFile.path)) {
            fs.unlinkSync(oldFile.path);
          }
          // Remove from array
          files.splice(existingFileIndex, 1);
        }

        // Add new file
        files.push({
          fieldName,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          path: file.path,
          size: file.size,
        });

        // Update the responses object to include file reference
        parsedResponses[fieldName] = {
          name: file.originalname,
          filename: file.filename,
          type: file.mimetype,
          size: file.size,
        };
      });
    }

    // Update submission
    const updatedSubmission = await FormSubmission.findByIdAndUpdate(
      id,
      {
        responses: parsedResponses,
        files,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Form submission updated successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error updating form submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update form submission",
      error: error.message,
    });
  }
};

// Delete a form submission
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    // Find submission
    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Form submission not found",
      });
    }

    // Delete associated files
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    // Delete the submission
    await FormSubmission.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Form submission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting form submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete form submission",
      error: error.message,
    });
  }
};
