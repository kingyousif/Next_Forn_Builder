const Certificate = require("../model/CertificateModel");
const multer = require("multer");
const path = require("path");
const Users = require("../model/user.model");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname
    );
  },
});

const upload = multer({ storage: storage });

module.exports = {
  // Create certificate with file upload
  createCertificate: async (req, res) => {
    try {
      const {
        username,
        fullName,
        certificationName,
        description,
        fromDate,
        toDate,
        duration,
        department,
        score,
        reason,
      } = req.body;

      // Validate required fields
      if (
        !username ||
        !fullName ||
        !certificationName ||
        !fromDate ||
        !toDate ||
        !department
      ) {
        return res.status(400).json({
          message:
            "Username, fullName, certificationName, fromDate, and toDate are required ",
        });
      }

      // Check for duplicate certificate
      const existingCertificate = await Certificate.findOne({
        username: username,
        certificationName: certificationName,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });

      if (existingCertificate) {
        return res.status(409).json({
          message: "Certificate with same details already exists",
        });
      }

      // Create new certificate
      const newCertificate = new Certificate({
        username,
        fullName,
        certificationName,
        description,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        duration,
        certificationImage: req.file ? req.file.filename : null,
        department,
      });

      await newCertificate.save();

      res.status(201).json({
        message: "Certificate submitted successfully",
        certificate: newCertificate,
      });
    } catch (error) {
      console.error("Certificate creation error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Fetch all certificates
  // Fetch all certificates or certificates by username
  fetchCertificates: async (req, res) => {
    try {
      const { username } = req.body;
      let user = await Users.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let certificates;

      if (user.role == "user") {
        certificates = await Certificate.find({
          username: username,
          department: username.department,
        }).sort({
          createdAt: -1,
        });
      }
      if (user.role == "admin") {
        certificates = await Certificate.find({
          department: username.department,
        }).sort({
          createdAt: -1,
        });
      }

      if (user.role == "super admin") {
        certificates = await Certificate.find({}).sort({
          createdAt: -1,
        });
      }

      if (username && certificates.length === 0) {
        return res
          .status(404)
          .json({ message: "No certificates found for this username" });
      }

      res.status(200).json(certificates);
    } catch (error) {
      console.error("Fetch certificates error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Update certificate status
  updateCertificateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, score, reason } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const certificate = await Certificate.findByIdAndUpdate(
        id,
        { status, reason, score },
        { new: true }
      );

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.status(200).json({
        message: "Certificate status updated successfully",
        certificate,
      });
    } catch (error) {
      console.error("Update certificate status error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Delete certificate
  deleteCertificate: async (req, res) => {
    try {
      const { id } = req.params;

      const certificate = await Certificate.findByIdAndDelete(id);

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.status(200).json({
        message: "Certificate deleted successfully",
        deletedCertificate: certificate,
      });
    } catch (error) {
      console.error("Delete certificate error:", error);
      res.status(500).json({
        message: "Failed to delete certificate",
        error: error.message,
      });
    }
  },

  // Export multer upload middleware
  upload: upload.single("certificationImage"),
};
