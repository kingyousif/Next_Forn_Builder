const userModel = require("../model/user.model.js");
const WorkSwap = require("../model/WorkSwapModel.js");
const { logAction } = require("../utils/loggingService");

module.exports = {
  // Create a new work swap request
  // At the top of the file

  // Inside the createWorkSwap method
  createWorkSwap: async (req, res) => {
    try {
      const {
        createdName,
        position,
        swapingName,
        Createdsheft,
        createdDate,
        forSheft,
        forDate,
        department,
        reason,
      } = req.body;

      // Validate input
      if (
        !createdName ||
        !position ||
        !swapingName ||
        !Createdsheft ||
        !createdDate ||
        !forSheft ||
        !forDate ||
        !department
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Please fill all the fields" });
      }

      const workSwap = new WorkSwap({
        createdName,
        position,
        swapingName,
        Createdsheft,
        createdDate,
        forSheft,
        forDate,
        department,
        reason,
      });

      await workSwap.save();

      // Log successful work swap creation
      await logAction(
        req,
        res,
        "workSwap",
        "createWorkSwap",
        "Create work swap request",
        "success",
        null,
        {
          workSwapId: workSwap._id,
          createdName: workSwap.createdName,
          swapingName: workSwap.swapingName,
          department: workSwap.department,
        }
      );

      res.status(201).json({
        success: true,
        message: "Work swap request created successfully",
        workSwap,
      });
    } catch (error) {
      // Log failed work swap creation
      await logAction(
        req,
        res,
        "workSwap",
        "createWorkSwap",
        "Create work swap request",
        "failure",
        error.message,
        {
          createdName: req.body?.createdName,
          swapingName: req.body?.swapingName,
          department: req.body?.department,
        }
      );

      console.log("Error in createWorkSwap", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get all work swap requests
  getAllWorkSwaps: async (req, res) => {
    try {
      const user = req.userId;
      const userRole = await userModel
        .findById(user)
        .select("role department fullName");
      if (userRole.role === "user") {
        const workSwaps = await WorkSwap.find({
          department: userRole.department,
          createdName: userRole.fullName,
        }).sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSwaps,
        });
      }
      if (userRole.role === "admin") {
        const workSwaps = await WorkSwap.find({
          department: userRole.department,
        }).sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSwaps,
        });
      }
      if (userRole.role === "super admin") {
        const workSwaps = await WorkSwap.find().sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSwaps,
        });
      }
    } catch (error) {
      console.log("Error in getAllWorkSwaps", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get work swap requests by department
  getWorkSwapsByDepartment: async (req, res) => {
    try {
      const { department } = req.params;
      const workSwaps = await WorkSwap.find({ department }).sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        workSwaps,
      });
    } catch (error) {
      console.log("Error in getWorkSwapsByDepartment", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get work swap requests by user (created by or swapping with)
  getWorkSwapsByUser: async (req, res) => {
    try {
      const { userName } = req.params;
      const workSwaps = await WorkSwap.find({
        $or: [{ createdName: userName }, { swapingName: userName }],
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        workSwaps,
      });
    } catch (error) {
      console.log("Error in getWorkSwapsByUser", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Update work swap request status (approve/reject)
  updateWorkSwapStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.userId;
      const userRole = await userModel.findById(user).select("role");
      if (userRole.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }

      const workSwap = await WorkSwap.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!workSwap) {
        return res
          .status(404)
          .json({ success: false, message: "Work swap request not found" });
      }
      res.status(200).json({
        success: true,
        message: `Work swap request ${status}`,
        workSwap,
      });
    } catch (error) {
      console.log("Error in updateWorkSwapStatus", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Delete work swap request
  deleteWorkSwap: async (req, res) => {
    try {
      const { id } = req.params;
      const workSwap = await WorkSwap.findByIdAndDelete(id);

      if (!workSwap) {
        return res
          .status(404)
          .json({ success: false, message: "Work swap request not found" });
      }

      res.status(200).json({
        success: true,
        message: "Work swap request deleted successfully",
      });
    } catch (error) {
      console.log("Error in deleteWorkSwap", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
