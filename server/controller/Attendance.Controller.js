const Attendance = require("../model/AttendanceModel");
const AttendanceUserModel = require("../model/AttendanceUserModel");

module.exports = {
  createAttendance: async (req, res) => {
    try {
      const attendanceData = req.body; // expecting an array of objects
      console.log(`Received ${attendanceData?.length || 0} attendance records`);

      if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
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

      // getting the length of the attendance model
      const length = await Attendance.countDocuments();

      for (const record of attendanceData) {
        try {
          // Check if this record already exists
          const existingRecord = await Attendance.findOne({
            timestamp: record.timestamp,
            user_name: record.user_name,
          });

          if (existingRecord) {
            // Skip this record as it's a duplicate
            results.duplicates++;
            continue;
          }

          record.uid = length + 1;
          // added 3 hours to the timestamp
          record.timestamp = new Date(record.timestamp);
          record.timestamp.setHours(record.timestamp.getHours() + 3);

          // Insert the new record
          await Attendance.create(record);
          results.inserted++;
        } catch (err) {
          console.error("Error processing record:", err);
          console.error("Failed record data:", record);
          results.failed++;

          // Store detailed error information
          if (!results.failedRecords) {
            results.failedRecords = [];
          }
          results.failedRecords.push({
            record: record,
            error: err.message,
            errorCode: err.code || "UNKNOWN_ERROR",
          });
        }
      }

      return res.status(200).json({
        message: "Attendance processing completed",
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
    try {
      const Attendances = await Attendance.find({});
      res.status(200).json(Attendances);
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  getStudentById: async (req, res) => {
    try {
      const attendanceUserName = await AttendanceUserModel.findById(
        req.params.id
      );
      const student = await Attendance.find({
        user_name: attendanceUserName.name,
      }).sort({ timestamp: 1 });

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

  editAttendance: async (req, res) => {
    try {
      // Extract uid directly from params without destructuring
      const uid = req.params.id;
      const { status, timestamp, user_name } = req.body;

      // Use findOne instead of find since we only need one document
      const student = await Attendance.findOne({
        uid: uid,
        user_name: user_name,
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Update the student record
      const updatedStudent = await Attendance.findOneAndUpdate(
        { uid: uid, user_name: user_name },
        {
          status: status,
          timestamp: timestamp,
        },
        {
          new: true,
          // runValidators: true, // Run model validations on update
        }
      );

      if (!updatedStudent) {
        return res
          .status(404)
          .json({ message: "Failed to update student attendance" });
      }

      console.log("🚀 ~ editAttendance: ~ updatedStudent:", updatedStudent);
      res.status(200).json(updatedStudent);
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        message: "Failed to update attendance record",
        error: error.message,
      });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const student = await Attendance.findByIdAndDelete(req.params.id);
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

      const result = await Attendance.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "No Attendance found with the provided IDs" });
      }

      res.status(200).json({
        message: "Attendance deleted successfully",
        count: result.deletedCount,
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({
        message: "Failed to delete Attendance",
        error: error.message,
      });
    }
  },
};
