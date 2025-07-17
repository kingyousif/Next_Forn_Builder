// controller/TimeManagementController.js
const TimeManagement = require("../model/TimeManagementModel");
const AttendanceUser = require("../model/AttendanceUserModel");

// CommonJS syntax
module.exports = {
  createTimeManagement: async (req, res) => {
    try {
      const {
        name,
        userId,
        userNames,
        workHoursPerDay,
        workDaysPerWeek,
        graceMinutesLate,
        graceMinutesEarly,
        startTime,
        endTime,
        notes,
        // New fields
        scheduleType = "standard",
        schedulePatterns = [],
      } = req.body;
      console.log("🚀 ~ createTimeManagement: ~ req.body:", req.body);

      // Validate schedule patterns for flexible schedules
      if (scheduleType === "flexible" && schedulePatterns.length === 0) {
        return res.status(400).json({
          message: "Flexible schedules must have at least one schedule pattern",
        });
      }

      // Validate pattern structure
      if (scheduleType === "flexible") {
        for (const pattern of schedulePatterns) {
          if (!pattern.days || pattern.days.length === 0) {
            return res.status(400).json({
              message: "Each schedule pattern must specify at least one day",
            });
          }
          if (!pattern.startTime || !pattern.endTime) {
            return res.status(400).json({
              message: "Each schedule pattern must have start and end times",
            });
          }
        }
      }

      // Check if any of these userIds already exist in other time schedules

      const existingSchedules = await TimeManagement.find({
        userId: { $in: userId },
      });

      if (existingSchedules.length > 0) {
        // Get list of already assigned userIds

        const alreadyAssignedUserIds = [];

        existingSchedules.forEach((schedule) => {
          schedule.userId.forEach((id) => {
            if (userId.includes(id)) {
              alreadyAssignedUserIds.push(id);
            }
          });
        });

        return res.status(400).json({
          message: `Some employees are already assigned to other schedules: ${alreadyAssignedUserIds.join(
            ", "
          )}`,
        });
      }

      const newTimeManagement = new TimeManagement({
        name,
        userId,
        userNames,
        workHoursPerDay,
        workDaysPerWeek,
        graceMinutesLate,
        graceMinutesEarly,
        startTime,
        endTime,
        notes,
        scheduleType,
        schedulePatterns,
      });

      await AttendanceUser.updateMany(
        { userId: { $in: userId } },

        { $set: { active: true } }
      );

      await newTimeManagement.save();

      res.json({ message: "TimeManagement created successfully" });
    } catch (error) {
      res

        .status(500)

        .json({ message: "Failed to create TimeManagement", error });
    }
  },

  updateTimeManagement: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        userId,
        userNames,
        workHoursPerDay,
        workDaysPerWeek,
        graceMinutesLate,
        graceMinutesEarly,
        startTime,
        endTime,
        notes,
        // New fields
        scheduleType = "standard",
        schedulePatterns = [],
      } = req.body;
      console.log("🚀 ~ updateTimeManagement: ~ req.body:", req.body);

      // Same validation as create
      if (scheduleType === "flexible" && schedulePatterns.length === 0) {
        return res.status(400).json({
          message: "Flexible schedules must have at least one schedule pattern",
        });
      }

      // Check if any of these userIds already exist in other time schedules (excluding current one)

      const existingSchedules = await TimeManagement.find({
        _id: { $ne: id },

        userId: { $in: userId },
      });

      if (existingSchedules.length > 0) {
        // Get list of already assigned userIds

        const alreadyAssignedUserIds = [];

        existingSchedules.forEach((schedule) => {
          schedule.userId.forEach((id) => {
            if (userId.includes(id)) {
              alreadyAssignedUserIds.push(id);
            }
          });
        });

        return res.status(400).json({
          message: `Some employees are already assigned to other schedules: ${alreadyAssignedUserIds.join(
            ", "
          )}`,
        });
      }

      const updatedTimeManagement = await TimeManagement.findByIdAndUpdate(
        id,
        {
          name,
          userId,
          userNames,
          workHoursPerDay,
          workDaysPerWeek,
          graceMinutesLate,
          graceMinutesEarly,
          startTime,
          endTime,
          notes,
          scheduleType,
          schedulePatterns,
        },
        { new: true }
      );

      await AttendanceUser.updateMany(
        { userId: { $in: userId } },

        { $set: { active: true } }
      );

      res.json({ message: "TimeManagement updated successfully" });
    } catch (error) {
      res

        .status(500)

        .json({ message: "Failed to update TimeManagement", error });
    }
  },

  deleteTimeManagement: async (req, res) => {
    try {
      const { id } = req.params;

      // Get the timeManagement record first to get the userIds

      const timeManagement = await TimeManagement.findById(id);

      if (!timeManagement) {
        return res.status(404).json({ message: "TimeManagement not found" });
      }

      await TimeManagement.findByIdAndDelete(id);

      await AttendanceUser.updateMany(
        { userId: { $in: timeManagement.userId } },

        { $set: { active: false } }
      );

      res.json({ message: "TimeManagement deleted successfully" });
    } catch (error) {
      res

        .status(500)

        .json({ message: "Failed to delete TimeManagement", error });
    }
  },

  deleteTimeManagement: async (req, res) => {
    try {
      const { id } = req.params;
      // Get the timeManagement record first to get the userIds
      const timeManagement = await TimeManagement.findById(id);
      if (!timeManagement) {
        return res.status(404).json({ message: "TimeManagement not found" });
      }

      await TimeManagement.findByIdAndDelete(id);
      await AttendanceUser.updateMany(
        { userId: { $in: timeManagement.userId } },
        { $set: { active: false } }
      );

      res.json({ message: "TimeManagement deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete TimeManagement", error });
    }
  },

  fetchTimeManagement: async (req, res) => {
    try {
      // Find documents that match the name parameter and select only the name and age fields
      const TimeManagements = await TimeManagement.find({}).select(
        "name userId userNames workHoursPerDay workDaysPerWeek graceMinutesLate graceMinutesEarly startTime endTime notes scheduleType schedulePatterns"
      );
      // Send the filtered results as JSON
      res.json(TimeManagements);
    } catch (error) {
      // Send an error response if the query fails
      res
        .status(500)
        .json({ message: "Failed to fetch TimeManagement", error: error });
    }
  },

  // Add a new endpoint to check user availability
  checkUserAvailability: async (req, res) => {
    try {
      const { userId, currentScheduleId } = req.body;

      // Build the query to find schedules with any of these userIds
      const query = { userId: { $in: userId } };

      // If updating an existing schedule, exclude it from the check
      if (currentScheduleId) {
        query._id = { $ne: currentScheduleId };
      }

      const existingSchedules = await TimeManagement.find(query);

      if (existingSchedules.length > 0) {
        // Get list of already assigned userIds and their names
        const assignedUsers = [];
        existingSchedules.forEach((schedule) => {
          schedule.userId.forEach((id, index) => {
            if (userId.includes(id)) {
              assignedUsers.push(schedule.userNames[index] || id);
            }
          });
        });

        return res.json({
          available: false,
          assignedUsers,
        });
      }

      res.json({ available: true });
    } catch (error) {
      res.status(500).json({
        message: "Failed to check user availability",
        error: error.message,
      });
    }
  },
};
