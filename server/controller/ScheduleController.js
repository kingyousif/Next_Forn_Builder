const {
  Shift,
  UserAvailability,
  ScheduleAssignment,
} = require("../model/ScheduleModel");
const Users = require("../model/user.model");

module.exports = {
  // Shift management
  createShift: async (req, res) => {
    try {
      const { name, startTime, endTime, department, createdBy, employeeCount } =
        req.body;

      // Validate input
      if (
        !name ||
        !startTime ||
        !endTime ||
        !department ||
        !createdBy ||
        !employeeCount
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newShift = new Shift({
        name,
        startTime,
        endTime,
        department,
        createdBy, // Assuming you want to store the user ID
        employeeCount,
      });

      await newShift.save();
      res
        .status(201)
        .json({ message: "Shift created successfully", shift: newShift });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create shift", error: error.message });
    }
  },

  getShifts: async (req, res) => {
    try {
      const user = req.userId;

      const userDepartment = await Users.findOne({ _id: user });

      if (!userDepartment) {
        return res.status(404).json({ message: "User not found" });
      }

      const userDepartmentName = userDepartment.department;
      const shifts = await Shift.find({ department: userDepartmentName });
      res.status(200).json(shifts);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch shifts", error: error.message });
    }
  },

  updateShift: async (req, res) => {
    try {
      const { id, name, startTime, endTime } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Shift ID is required" });
      }

      const updatedShift = await Shift.findByIdAndUpdate(
        id,
        { name, startTime, endTime },
        { new: true }
      );

      if (!updatedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      res
        .status(200)
        .json({ message: "Shift updated successfully", shift: updatedShift });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update shift", error: error.message });
    }
  },

  deleteShift: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Shift ID is required" });
      }

      const deletedShift = await Shift.findByIdAndDelete(id);

      if (!deletedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      res.status(200).json({ message: "Shift deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete shift", error: error.message });
    }
  },

  // User availability management
  setUserAvailability: async (req, res) => {
    try {
      const {
        userId,
        maxWorkDays,
        unavailableDates,
        allowedShifts,
        isFridayOff,
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if user exists
      const userExists = await Users.findById(userId);
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userDepartment = userExists.department;

      // Find existing availability or create new one
      let userAvailability = await UserAvailability.findOne({
        userId,
        department: userDepartment,
      });

      if (userAvailability) {
        // Update existing
        userAvailability.maxWorkDays =
          maxWorkDays || userAvailability.maxWorkDays;

        if (unavailableDates) {
          // Convert string dates to Date objects if needed
          const parsedDates = unavailableDates.map((date) =>
            typeof date === "string" ? new Date(date) : date
          );
          userAvailability.unavailableDates = parsedDates;
          userAvailability.allowedShifts =
            allowedShifts || userAvailability.allowedShifts;
        }

        userAvailability.isFridayOff =
          isFridayOff || userAvailability.isFridayOff;
      } else {
        // Create new
        userAvailability = new UserAvailability({
          userId,
          maxWorkDays: maxWorkDays || 20, // Default to 20 if not specified
          unavailableDates: unavailableDates || [],
          userName: userExists.name,
          allowedShifts: allowedShifts || [],
          isFridayOff: isFridayOff || false,
          department: userDepartment,
        });
      }

      await userAvailability.save();
      res.status(200).json({
        message: "User availability updated successfully",
        availability: userAvailability,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update user availability",
        error: error.message,
      });
    }
  },

  getUserAvailability: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userDepartment = await Users.findOne({ _id: userId });

      if (!userDepartment) {
        return res.status(404).json({ message: "User not found" });
      }

      const userAvailability = await UserAvailability.find({
        department: userDepartment.department,
      });

      if (!userAvailability) {
        return res.status(404).json({ message: "User availability not found" });
      }

      res.status(200).json(userAvailability);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user availability",
        error: error.message,
      });
    }
  },

  getUserAvailabilityById: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userExists = await Users.findById(userId);
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userAvailability = await UserAvailability.findOne({
        userId: userId,
        department: userExists.department,
      });

      if (!userAvailability) {
        return res
          .status(200)
          .json({ message: "User availability not found", success: false });
      }

      res.status(200).json(userAvailability);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user availability",
        error: error.message,
      });
    }
  },
  deleteUserAvailability: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userExists = await Users.findById(id);
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const deletedAvailability = await UserAvailability.findOneAndDelete({
        userId: id,
        department: userExists.department,
      });

      if (!deletedAvailability) {
        return res.status(404).json({ message: "User availability not found" });
      }

      res.status(200).json({
        message: "User availability deleted successfully",
        deletedAvailability,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete user availability",
        error: error.message,
      });
    }
  },

  // Schedule management
  createSchedule: async (req, res) => {
    try {
      const { date, assignments } = req.body;

      if (!date || !assignments || !Array.isArray(assignments)) {
        return res
          .status(400)
          .json({ message: "Valid date and assignments array are required" });
      }

      // Convert string date to Date object if needed
      const scheduleDate = typeof date === "string" ? new Date(date) : date;

      // Check if schedule for this date already exists
      let schedule = await ScheduleAssignment.findOne({
        date: {
          $gte: new Date(scheduleDate.setHours(0, 0, 0, 0)),
          $lt: new Date(scheduleDate.setHours(23, 59, 59, 999)),
        },
      });

      if (schedule) {
        // Update existing schedule
        schedule.assignments = assignments;
      } else {
        // Create new schedule
        schedule = new ScheduleAssignment({
          date: scheduleDate,
          assignments,
        });
      }

      await schedule.save();
      res.status(200).json({
        message: "Schedule created/updated successfully",
        schedule,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create/update schedule",
        error: error.message,
      });
    }
  },

  // Add this new function for batch schedule creation
  createBatchSchedule: async (req, res) => {
    try {
      const scheduleData = req.body;
      const user = req.userId;

      if (scheduleData.length === 0) {
        return res.status(400).json({
          message: "Request body must be an array of schedule objects",
        });
      }

      const results = [];
      const errors = [];

      const userDepartment = await Users.findOne({ _id: user });

      if (!userDepartment) {
        return res.status(404).json({ message: "User not found" });
      }

      const userDepartmentName = userDepartment.department;
      // Process each schedule object in the array
      for (const scheduleItem of scheduleData) {
        try {
          const { date, assignments } = scheduleItem;

          if (!date || !assignments || !Array.isArray(assignments)) {
            errors.push({
              date,
              error: "Valid date and assignments array are required",
            });
            continue;
          }

          // Convert string date to Date object if needed
          const scheduleDate = typeof date === "string" ? new Date(date) : date;

          // Check if schedule for this date already exists
          let schedule = await ScheduleAssignment.findOne({
            date: {
              $gte: new Date(new Date(scheduleDate).setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(scheduleDate).setHours(23, 59, 59, 999)),
            },
          });

          if (schedule) {
            // Update existing schedule
            schedule.assignments = assignments;
          } else {
            // Create new schedule
            schedule = new ScheduleAssignment({
              date: scheduleDate,
              assignments,
              department: userDepartmentName,
            });
          }
          await schedule.save();
          results.push({
            date: schedule.date,
            message: "Schedule created/updated successfully",
            id: schedule._id,
          });
        } catch (error) {
          errors.push({
            date: scheduleItem.date,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        message: `Processed ${results.length} schedules successfully with ${errors.length} errors`,
        results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to process batch schedule creation",
        error: error.message,
      });
    }
  },

  getSchedule: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const user = req.userId;

      const userDepartment = await Users.findOne({ _id: user });

      if (!userDepartment) {
        return res.status(404).json({ message: "User not found" });
      }

      const userDepartmentName = userDepartment.department;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Start and end dates are required" });
      }

      // Convert string dates to Date objects if needed
      const start =
        typeof startDate === "string" ? new Date(startDate) : startDate;
      const end = typeof endDate === "string" ? new Date(endDate) : endDate;

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const schedules = await ScheduleAssignment.find({
        date: { $gte: start, $lte: end },
        department: userDepartmentName,
      }).lean();

      // Transform the data to match desired format
      const formattedSchedules = schedules.map((schedule) => {
        return {
          date: schedule.date,
          assignments: schedule.assignments.map((assignment) => ({
            userId: assignment.userId.toString(),
            userName: assignment.userName,
            shiftId: assignment.shiftId.toString(),
          })),
        };
      });

      res.status(200).json(formattedSchedules);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch schedules", error: error.message });
    }
  },

  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Schedule ID is required" });
      }

      const deletedSchedule = await ScheduleAssignment.findByIdAndDelete(id);

      if (!deletedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete schedule", error: error.message });
    }
  },
};
