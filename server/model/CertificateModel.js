const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    certificationName: { type: String, required: true },
    description: { type: String, required: false },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    duration: { type: String, required: false },
    certificationImage: { type: String, required: false }, // Store image path/filename
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    department: { type: String, required: true },
    score: { type: Number, required: false },
    reason: { type: String, required: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Certificate", CertificateSchema);
