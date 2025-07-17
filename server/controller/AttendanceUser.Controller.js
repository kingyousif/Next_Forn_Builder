const AttendanceUser = require("../model/AttendanceUserModel");
const Users = require("../model/user.model");
const UserAssignment = require("../model/UserAssignment");

module.exports = {
  createAttendance: async (req, res) => {
    try {
      const AttendanceData = req.body; // expecting an array of objects

      if (!Array.isArray(AttendanceData) || AttendanceData.length === 0) {
        return res
          .status(400)
          .json({ message: "No data provided or invalid format" });
      }

      // Process each record individually to handle duplicates
      const results = {
        inserted: 0,
        duplicates: 0,
        failed: 0,
      };

      for (const record of AttendanceData) {
        try {
          // Check if this record already exists
          const existingRecord = await AttendanceUser.findOne({
            name: record.name,
            userId: record.userId,
          });

          if (existingRecord) {
            // Skip this record as it's a duplicate
            results.duplicates++;
            continue;
          }

          // Insert the new record
          await AttendanceUser.create(record);
          results.inserted++;
        } catch (err) {
          console.error("Error processing record:", err);
          results.failed++;
        }
      }

      return res.status(200).json({
        message: "AttendanceUser processing completed",
        results: results,
      });
    } catch (error) {
      console.error("Insert error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  fetchAttendance: async (req, res) => {
    let { reqUserId } = req.body;
    try {
      let user = await Users.findById(reqUserId);

      if (user.role === "super admin") {
        const Attendances = await AttendanceUser.find({});
        res.status(200).json(Attendances);
      } else if (user.role === "admin" && user.department === "HR") {
        const Attendances = await AttendanceUser.find({});
        res.status(200).json(Attendances);
      } else if (user.role === "admin") {
        let userAttendance = await UserAssignment.find({
          $or: [{ userId: reqUserId }, { userDepartment: user.department }],
        });

        if (userAttendance.length > 0) {
          // Use Promise.all to handle multiple async findById operations
          const attendancePromises = userAttendance.map((userAssign) =>
            AttendanceUser.findById(userAssign.employeeId || reqUserId)
          );

          const attendances = await Promise.all(attendancePromises);
          console.log("🚀 ~ fetchAttendance: ~ attendances:", attendances);

          // Filter out any null results and send the valid attendances
          const validAttendances = attendances.filter(
            (attendance) => attendance
          );

          return res.status(200).json(validAttendances);
        } else {
          return res.status(200).json([]);
        }
      } else if (user.role === "user") {
        let userAttendance = await UserAssignment.find({ userId: reqUserId });

        if (userAttendance.length > 0) {
          const Attendances = await AttendanceUser.findById(
            userAttendance[0].employeeId || reqUserId
          );

          if (Attendances) {
            res.status(200).json([Attendances]);
          }
        } else {
          return res.status(200).json([]);
        }
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  getStudentByIdAndChangeActive: async (req, res) => {
    try {
      const student = await AttendanceUser.findByIdAndUpdate(
        req.params.id,
        { active: false },
        { new: true }
      );
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const student = await AttendanceUser.findByIdAndDelete(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json({
        message: "Student deleted successfully",
        deletedStudent: student,
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        message: "Failed to delete student",
        error: error.message,
      });
    }
  },

  // Bulk delete functionality
  bulkDeleteAttendance: async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ message: "No IDs provided for deletion" });
      }

      const result = await AttendanceUser.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "No AttendanceUser found with the provided IDs" });
      }

      res.status(200).json({
        message: "AttendanceUser deleted successfully",
        count: result.deletedCount,
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({
        message: "Failed to delete AttendanceUser",
        error: error.message,
      });
    }
  },
};
