// models/FormSubmission.js
const mongoose = require("mongoose");

// Define a flexible schema for form submissions
const formSubmissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: "string",
      ref: "User",
      required: true,
    },
    createdFor: {
      type: "string",
      ref: "User",
      required: true,
    },
    department: {
      type: "string",
      ref: "Department",
      required: true,
    },
    // Using Mixed type to allow for dynamic response structure
    responses: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    files: [
      {
        fieldName: String,
        originalName: String,
        filename: String,
        mimetype: String,
        path: String,
        size: Number,
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    totalPercentage: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Add an index for faster querying
formSubmissionSchema.index({ formId: 1, userId: 1 });

const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

module.exports = FormSubmission;
