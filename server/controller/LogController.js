const Log = require("../model/LogModel.js");

module.exports = {
  // Get all logs with pagination
  getLogs: async (req, res) => {
    try {
      // Get all logs without filtering
      const logs = await Log.find()
        .sort({ createdAt: -1 })
        .populate("userId", "name fullName role");

      res.status(200).json({
        success: true,
        logs,
        total: logs.length,
      });
    } catch (error) {
      console.log("Error in getLogs", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get logs for a specific user
  getUserLogs: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Count total documents for this user
      const total = await Log.countDocuments({ userId });

      // Get logs with pagination
      const logs = await Log.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.status(200).json({
        success: true,
        logs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.log("Error in getUserLogs", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get logs for a specific module
  getModuleLogs: async (req, res) => {
    try {
      const { module } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Count total documents for this module
      const total = await Log.countDocuments({ module });

      // Get logs with pagination
      const logs = await Log.find({ module })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("userId", "name fullName role");

      res.status(200).json({
        success: true,
        logs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.log("Error in getModuleLogs", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Delete logs older than a certain date
  deleteOldLogs: async (req, res) => {
    try {
      const { olderThan } = req.body; // Date string

      if (!olderThan) {
        return res
          .status(400)
          .json({ success: false, message: "Please provide a date" });
      }

      const date = new Date(olderThan);

      const result = await Log.deleteMany({ createdAt: { $lt: date } });

      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} logs older than ${olderThan}`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.log("Error in deleteOldLogs", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
