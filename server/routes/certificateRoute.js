const express = require("express");
const {
  createCertificate,
  fetchCertificates,
  updateCertificateStatus,
  deleteCertificate,
  upload,
} = require("../controller/CertificateController");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

// Public routes
router.post("/submit", upload, createCertificate);
router.post("/fetch", fetchCertificates);

// Protected routes (require authentication)
router.put("/updateStatus/:id", verifyToken, updateCertificateStatus);
router.delete("/delete/:id", verifyToken, deleteCertificate);

module.exports = router;
