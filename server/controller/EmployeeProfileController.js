const EmployeeProfile = require("../model/EmployeeProfileModel");
const Users = require("../model/user.model");
const { logAction } = require("../utils/loggingService");

module.exports = {
  createEmployeeProfile: async (req, res) => {
    try {
      const employeeData = req.body;
      const userId = req.userId; // From verifyToken middleware

      // Get user info for logging and department assignment
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create new employee profile
      const newEmployeeProfile = new EmployeeProfile({
        ...employeeData,
        createdBy: userId,
        department: user.department,
      });

      await newEmployeeProfile.save();

      // Log successful creation
      await logAction(
        req,
        res,
        "employeeProfile",
        "createEmployeeProfile",
        "Create employee profile",
        "success",
        null,
        {
          employeeId: newEmployeeProfile._id,
          employeeName: newEmployeeProfile.name,
          createdBy: user.name,
        }
      );

      res.json({
        message: "Employee profile created successfully",
        employeeProfile: newEmployeeProfile,
      });
    } catch (error) {
      // Log failed creation
      await logAction(
        req,
        res,
        "employeeProfile",
        "createEmployeeProfile",
        "Create employee profile",
        "failure",
        error.message,
        { employeeName: req.body?.name }
      );

      res.status(500).json({
        message: "Failed to create employee profile",
        error: error.message,
      });
    }
  },

  fetchEmployeeProfiles: async (req, res) => {
    try {
      const { id } = req.body; // User ID
      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let employeeProfiles;
      const { role, department } = user;

      if (role === "super admin") {
        // Super admin can see all employee profiles
        employeeProfiles = await EmployeeProfile.find({});
      } else if (role === "admin" && department === "HR") {
        // HR admin can see all employee profiles
        employeeProfiles = await EmployeeProfile.find({});
      } else if (role === "admin") {
        // Department admin can see only their department's profiles
        employeeProfiles = await EmployeeProfile.find({
          department: user.department,
        });
      } else {
        // Regular users can only see profiles assigned to them
        employeeProfiles = await EmployeeProfile.find({ assignedUserId: id });
      }

      res.json(employeeProfiles);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch employee profiles",
        error: error.message,
      });
    }
  },

  fetchEmployeeProfileById: async (req, res) => {
    try {
      const { id } = req.params;
      const employeeProfile = await EmployeeProfile.findById(id);

      if (!employeeProfile) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      res.json(employeeProfile);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch employee profile",
        error: error.message,
      });
    }
  },

  updateEmployeeProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.userId;

      const employeeProfile = await EmployeeProfile.findById(id);
      if (!employeeProfile) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      // Update the employee profile
      const updatedProfile = await EmployeeProfile.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      // Log successful update
      const user = await Users.findById(userId);
      await logAction(
        req,
        res,
        "employeeProfile",
        "updateEmployeeProfile",
        "Update employee profile",
        "success",
        null,
        {
          employeeId: updatedProfile._id,
          employeeName: updatedProfile.name,
          updatedBy: user?.name,
        }
      );

      res.json({
        message: "Employee profile updated successfully",
        employeeProfile: updatedProfile,
      });
    } catch (error) {
      // Log failed update
      await logAction(
        req,
        res,
        "employeeProfile",
        "updateEmployeeProfile",
        "Update employee profile",
        "failure",
        error.message,
        { employeeId: req.params?.id }
      );

      res.status(500).json({
        message: "Failed to update employee profile",
        error: error.message,
      });
    }
  },

  deleteEmployeeProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const employeeProfile = await EmployeeProfile.findById(id);
      if (!employeeProfile) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      await EmployeeProfile.findByIdAndDelete(id);

      // Log successful deletion
      const user = await Users.findById(userId);
      await logAction(
        req,
        res,
        "employeeProfile",
        "deleteEmployeeProfile",
        "Delete employee profile",
        "success",
        null,
        {
          employeeId: id,
          employeeName: employeeProfile.name,
          deletedBy: user?.name,
        }
      );

      res.json({ message: "Employee profile deleted successfully" });
    } catch (error) {
      // Log failed deletion
      await logAction(
        req,
        res,
        "employeeProfile",
        "deleteEmployeeProfile",
        "Delete employee profile",
        "failure",
        error.message,
        { employeeId: req.params?.id }
      );

      res.status(500).json({
        message: "Failed to delete employee profile",
        error: error.message,
      });
    }
  },

  fetchEmployeeProfilesByDepartment: async (req, res) => {
    try {
      const { department, user } = req.body;
      const userInfo = await Users.findById(user).select("role department");

      if (!userInfo || userInfo.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      let employeeProfiles;

      // Handle HR and Media admins
      if (userInfo.department === "HR" || userInfo.department === "Media") {
        if (department && (department === "HR" || department === "Media")) {
          employeeProfiles = await EmployeeProfile.find({
            department: department,
          });
        } else {
          employeeProfiles = await EmployeeProfile.find({});
        }
      } else {
        // Other department admins can only see their department
        employeeProfiles = await EmployeeProfile.find({
          department: userInfo.department,
        });
      }

      res.json(employeeProfiles);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch employee profiles by department",
        error: error.message,
      });
    }
  },

  bulkDeleteEmployeeProfiles: async (req, res) => {
    try {
      const { ids } = req.body; // Array of employee profile IDs
      const userId = req.userId;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      const deletedProfiles = await EmployeeProfile.find({ _id: { $in: ids } });
      await EmployeeProfile.deleteMany({ _id: { $in: ids } });

      // Log bulk deletion
      const user = await Users.findById(userId);
      await logAction(
        req,
        res,
        "employeeProfile",
        "bulkDeleteEmployeeProfiles",
        "Bulk delete employee profiles",
        "success",
        null,
        {
          deletedCount: deletedProfiles.length,
          deletedBy: user?.name,
          deletedIds: ids,
        }
      );

      res.json({
        message: `${deletedProfiles.length} employee profiles deleted successfully`,
        deletedCount: deletedProfiles.length,
      });
    } catch (error) {
      // Log failed bulk deletion
      await logAction(
        req,
        res,
        "employeeProfile",
        "bulkDeleteEmployeeProfiles",
        "Bulk delete employee profiles",
        "failure",
        error.message,
        { requestedIds: req.body?.ids }
      );

      res.status(500).json({
        message: "Failed to delete employee profiles",
        error: error.message,
      });
    }
  },
};
