const bcryptjs = require("bcryptjs");
const Users = require("../model/user.model");
const { logAction } = require("../utils/loggingService");

module.exports = {
  createUsers: async (req, res) => {
    try {
      let { name, fullName, phone, password, role, department } = req.body;

      // Validate required fields
      if (!name || !password) {
        throw new Error("Name and password are required");
      }

      // Hash password and normalize name
      password = await bcryptjs.hash(password, 10);
      name = name.trim().toLowerCase(); // Trim whitespace and convert to lowercase

      // Create and save new user
      let newUsers = new Users({
        name,
        fullName: fullName?.trim(), // Trim whitespace if fullName exists
        phone,
        password,
        role,
        department,
      });
      await newUsers.save();

      // Log successful user creation
      await logAction(
        req,
        res,
        "users",
        "createUsers",
        "Create user",
        "success",
        null,
        {
          userId: newUsers._id,
          name: newUsers.name,
          role: newUsers.role,
          department: newUsers.department,
        }
      );

      res.json({ message: "Users created successfully" });
    } catch (error) {
      // Log failed user creation
      await logAction(
        req,
        res,
        "users",
        "createUsers",
        "Create user",
        "failure",
        error.message ||
          (error.code === 11000 ? "Duplicate user" : "Unknown error"),
        { name: req.body?.name, role: req.body?.role }
      );

      if (error.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).json({
          message: "Users with the same name or fullName already exists",
          error,
        });
      }
      res.status(500).json({ message: "Failed to create Users", error });
    }
  },
  updateUsers: async (req, res) => {
    try {
      let { _id, name, fullName, phone, role, department } = req.body;

      let findUsers = await Users.findByIdAndUpdate({ _id });
      if (!findUsers) {
        return res.status(404).json({ message: "Users not found" });
      }

      findUsers.name = name.toLowerCase();
      findUsers.fullName = fullName;
      findUsers.phone = phone;
      findUsers.role = role;
      findUsers.department = department;
      await findUsers.save();
      res.json({ message: "Users updated successfully" });
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).json({
          message: "Users with the same name already exists",
          error,
        });
      }
      res.status(500).json({ message: "Failed to update Users", error });
    }
  },

  fetchUsers: async (req, res) => {
    try {
      const { id } = req.body; // ✅ Correctly destructure id

      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let Userss;
      const { name, role, department } = user;
      if (role === "super admin") {
        Userss = await Users.find({}).select(
          "name fullName role department createdAt"
        );
      } else if (role === "admin" && department === "HR") {
        Userss = await Users.find({ role: "user" }).select(
          "name fullName role department createdAt"
        );
      } else if (role === "admin") {
        Userss = await Users.find({
          department: user.department,
          role: { $in: ["user"] },
        }).select("name fullName role department createdAt");
      } else {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(Userss);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Users", error });
    }
  },
  fetchUsersById: async (req, res) => {
    try {
      const { id } = req.body; // ✅ Correctly destructure id
      const user = await Users.findById(id).select(
        "name fullName role department createdAt"
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  },

  fetchUsersDepartment: async (req, res) => {
    try {
      const { department, user } = req.body;
      let role = await Users.findById(user).select("role department");
      let users;
      if (role.role !== "admin") {
        return res.status(404).json({ message: "User not found" });
      }

      // Handle HR and Media admins
      if (role.department === "HR" || role.department === "Media") {
        // If department is specified and is HR/Media, filter by department
        if (department && (department === "HR" || department === "Media")) {
          users = await Users.find({
            department: department,
            role: "user",
          }).select("name fullName role department createdAt");
        }
        // Otherwise return all users
        else {
          users = await Users.find({
            role: "user",
          }).select("name fullName role department createdAt");
        }
      }
      // Handle other department admins
      else {
        users = await Users.find({
          department: role.department,
          role: "user",
        }).select("name fullName role department createdAt");
      }

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  },
  fetchUsersDepartmentForSwaping: async (req, res) => {
    try {
      const user = req.userId;
      let userName = await Users.findById(user).select("department");
      let users;

      // Handle HR and Media admins
      if (userName.department) {
        console.log(userName.department);
        users = await Users.find({
          department: userName.department,
          role: "user",
        }).select("fullName role department");
      }
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  },

  fetchOneUsersDepartment: async (req, res) => {
    try {
      const { names } = req.body;

      // Validate input
      if (!names) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Find user and select department
      const realDepartment = await Users.find({ name: names })
        .select("department fullName role")
        .lean();

      // Check if user exists
      if (!realDepartment || realDepartment.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(realDepartment);
    } catch (error) {
      console.error("Error fetching user department:", error);
      res.status(500).json({
        message: "Failed to fetch user department",
        error: error.message,
      });
    }
  },
  deleteUsers: async (req, res) => {
    try {
      const deleteUsers = await Users.findByIdAndDelete({
        _id: req.params.id,
      });
      if (!deleteUsers) {
        return res.status(404).json({ message: "Users not found" });
      }
      res.json({ message: "Users deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete Users" + error, error });
    }
  },
};
