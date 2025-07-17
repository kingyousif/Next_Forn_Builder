const UserAssignment = require("../model/UserAssignment");
const Users = require("../model/user.model");
const AttendanceUser = require("../model/AttendanceUserModel");
const { logAction } = require("../utils/loggingService");

module.exports = {
  createUserAssignment: async (req, res) => {
    try {
      const {
        userId,
        employeeId,
        userName,
        employeeName,
        userDepartment,
        userRole,
      } = req.body;

      // Validate required fields
      if (!userId || !employeeId || !userName || !employeeName) {
        return res.status(400).json({
          message:
            "UserId, employeeId, userName, and employeeName are required",
        });
      }

      // Verify that the user exists
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Verify that the employee exists
      const employee = await AttendanceUser.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // Check for existing assignment
      const existingAssignment = await UserAssignment.findOne({
        userId: userId,
        employeeId: employeeId,
      });

      if (existingAssignment) {
        return res.status(409).json({
          message: "Assignment already exists for this user and employee",
        });
      }

      // Create new user assignment
      const newUserAssignment = new UserAssignment({
        userId,
        employeeId,
        userName: userName.trim(),
        employeeName: employeeName.trim(),
        userDepartment: userDepartment?.trim() || user.department,
        userRole: userRole || user.role,
      });

      await newUserAssignment.save();

      // Log successful assignment creation
      await logAction(
        req,
        res,
        "userAssignment",
        "createUserAssignment",
        "Create user assignment",
        "success",
        null,
        {
          assignmentId: newUserAssignment._id,
          userId: userId,
          employeeId: employeeId,
          userName: userName,
          employeeName: employeeName,
        }
      );

      res.status(201).json({
        message: "User assignment created successfully",
        assignment: newUserAssignment,
      });
    } catch (error) {
      // Log failed assignment creation
      await logAction(
        req,
        res,
        "userAssignment",
        "createUserAssignment",
        "Create user assignment",
        "failure",
        error.message,
        {
          userId: req.body?.userId,
          employeeId: req.body?.employeeId,
        }
      );

      console.error("User assignment creation error:", error);
      res.status(500).json({
        message: "Failed to create user assignment",
        error: error.message,
      });
    }
  },

  fetchUserAssignments: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Verify user exists and get their role
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let assignments;

      if (user.role === "super admin") {
        // Super admin can see all assignments
        assignments = await UserAssignment.find({})
          .populate("userId", "name fullName department role")
          .populate("employeeId", "name userId")
          .sort({ createdAt: -1 });
      } else if (user.role === "admin") {
        // Admin can see assignments in their department
        assignments = await UserAssignment.find({
          userDepartment: user.department,
        })
          .populate("userId", "name fullName department role")
          .populate("employeeId", "name userId")
          .sort({ createdAt: -1 });
      } else {
        // Regular users can only see their own assignments
        assignments = await UserAssignment.find({ userId: userId })
          .populate("userId", "name fullName department role")
          .populate("employeeId", "name userId")
          .sort({ createdAt: -1 });
      }

      res.status(200).json(assignments);
    } catch (error) {
      console.error("Fetch user assignments error:", error);
      res.status(500).json({
        message: "Failed to fetch user assignments",
        error: error.message,
      });
    }
  },

  fetchUserAssignmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await UserAssignment.findById(id)
        .populate("userId", "name fullName department role")
        .populate("employeeId", "name userId");

      if (!assignment) {
        return res.status(404).json({
          message: "User assignment not found",
        });
      }

      res.status(200).json(assignment);
    } catch (error) {
      console.error("Fetch user assignment by ID error:", error);
      res.status(500).json({
        message: "Failed to fetch user assignment",
        error: error.message,
      });
    }
  },

  fetchAssignmentsByEmployee: async (req, res) => {
    try {
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      const assignments = await UserAssignment.find({ employeeId: employeeId })
        .populate("userId", "name fullName department role")
        .populate("employeeId", "name userId")
        .sort({ createdAt: -1 });

      res.status(200).json(assignments);
    } catch (error) {
      console.error("Fetch assignments by employee error:", error);
      res.status(500).json({
        message: "Failed to fetch assignments by employee",
        error: error.message,
      });
    }
  },

  updateUserAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        userId,
        employeeId,
        userName,
        employeeName,
        userDepartment,
        userRole,
      } = req.body;

      // Find the assignment
      const assignment = await UserAssignment.findById(id);
      if (!assignment) {
        return res.status(404).json({
          message: "User assignment not found",
        });
      }

      // If userId or employeeId is being changed, verify they exist
      if (userId && userId !== assignment.userId.toString()) {
        const user = await Users.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      if (employeeId && employeeId !== assignment.employeeId.toString()) {
        const employee = await AttendanceUser.findById(employeeId);
        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }
      }

      // Update the assignment
      const updatedAssignment = await UserAssignment.findByIdAndUpdate(
        id,
        {
          userId: userId || assignment.userId,
          employeeId: employeeId || assignment.employeeId,
          userName: userName?.trim() || assignment.userName,
          employeeName: employeeName?.trim() || assignment.employeeName,
          userDepartment: userDepartment?.trim() || assignment.userDepartment,
          userRole: userRole || assignment.userRole,
        },
        { new: true }
      )
        .populate("userId", "name fullName department role")
        .populate("employeeId", "name userId");

      res.status(200).json({
        message: "User assignment updated successfully",
        assignment: updatedAssignment,
      });
    } catch (error) {
      console.error("Update user assignment error:", error);
      res.status(500).json({
        message: "Failed to update user assignment",
        error: error.message,
      });
    }
  },

  deleteUserAssignment: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedAssignment = await UserAssignment.deleteMany({
        employeeId: id,
      });
      if (deletedAssignment.deletedCount === 0) {
        return res.status(404).json({
          message: "User assignment not found",
        });
      }

      // Log successful deletion
      await logAction(
        req,
        res,
        "userAssignment",
        "deleteUserAssignment",
        "Delete user assignment",
        "success",
        null,
        {
          assignmentId: id,
          userId: deletedAssignment.userId,
          employeeId: deletedAssignment.employeeId,
        }
      );

      res.status(200).json({
        message: "User assignment deleted successfully",
      });
    } catch (error) {
      console.error("Delete user assignment error:", error);
      res.status(500).json({
        message: "Failed to delete user assignment",
        error: error.message,
      });
    }
  },
};
