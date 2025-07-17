const userModel = require("../model/user.model.js");
const WorkSell = require("../model/WorkSellModel.js");
const { logAction } = require("../utils/loggingService");

module.exports = {
  // Create a new work sell request
  // At the top of the file

  // Inside the createWorkSell method
  createWorkSell: async (req, res) => {
    try {
      const {
        createdName,
        position,
        sellingName,
        Createdsheft,
        createdDate,
        department,
        reason,
      } = req.body;

      // Validate input
      if (
        !createdName ||
        !position ||
        !sellingName ||
        !Createdsheft ||
        !createdDate ||
        !department
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Please fill all the fields" });
      }

      const workSell = new WorkSell({
        createdName,
        position,
        sellingName,
        Createdsheft,
        createdDate,
        department,
        reason,
      });

      await workSell.save();

      // Log successful work sell creation
      await logAction(
        req,
        res,
        "workSell",
        "createWorkSell",
        "Create work sell request",
        "success",
        null,
        {
          workSellId: workSell._id,
          createdName: workSell.createdName,
          sellingName: workSell.sellingName,
          department: workSell.department,
        }
      );

      res.status(201).json({
        success: true,
        message: "Work sell request created successfully",
        workSell,
      });
    } catch (error) {
      // Log failed work sell creation
      await logAction(
        req,
        res,
        "workSell",
        "createWorkSell",
        "Create work sell request",
        "failure",
        error.message,
        {
          createdName: req.body?.createdName,
          sellingName: req.body?.sellingName,
          department: req.body?.department,
        }
      );

      console.log("Error in createWorkSell", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get all work sell requests
  getAllWorkSells: async (req, res) => {
    try {
      const user = req.userId;
      const userRole = await userModel
        .findById(user)
        .select("role department fullName");
      if (userRole.role === "user") {
        const workSells = await WorkSell.find({
          department: userRole.department,
          createdName: userRole.fullName,
        }).sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSells,
        });
      }
      if (userRole.role === "admin") {
        const workSells = await WorkSell.find({
          department: userRole.department,
        }).sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSells,
        });
      }
      if (userRole.role === "super admin") {
        const workSells = await WorkSell.find().sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          workSells,
        });
      }
    } catch (error) {
      console.log("Error in getAllWorkSells", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get work sell requests by department
  getWorkSellsByDepartment: async (req, res) => {
    try {
      const { department } = req.params;
      const workSells = await WorkSell.find({ department }).sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        workSells,
      });
    } catch (error) {
      console.log("Error in getWorkSellsByDepartment", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get work sell requests by user (created by or sellping with)
  getWorkSellsByUser: async (req, res) => {
    try {
      const { userName } = req.params;
      const workSells = await WorkSell.find({
        $or: [{ createdName: userName }, { sellingName: userName }],
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        workSells,
      });
    } catch (error) {
      console.log("Error in getWorkSellsByUser", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Update work sell request status (approve/reject)
  updateWorkSellStatus: async (req, res) => {
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

      const workSell = await WorkSell.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!workSell) {
        return res
          .status(404)
          .json({ success: false, message: "Work sell request not found" });
      }
      res.status(200).json({
        success: true,
        message: `Work sell request ${status}`,
        workSell,
      });
    } catch (error) {
      console.log("Error in updateWorkSellStatus", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Delete work sell request
  deleteWorkSell: async (req, res) => {
    try {
      const { id } = req.params;
      const workSell = await WorkSell.findByIdAndDelete(id);

      if (!workSell) {
        return res
          .status(404)
          .json({ success: false, message: "Work sell request not found" });
      }

      res.status(200).json({
        success: true,
        message: "Work sell request deleted successfully",
      });
    } catch (error) {
      console.log("Error in deleteWorkSell", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
