// controller/DepartmentController.js
const Department = require("../model/DepartmentModel");
const { logAction } = require("../utils/loggingService");

// CommonJS syntax
module.exports = {
  createDepartment: async (req, res) => {
    try {
      const {
        userName,
        employeeName,
        workPlace,
        Q1,
        Q2,
        Q3,
        Q4,
        Q5,
        Q6,
        Q7,
        Q8,
        Q9,
        Q10,
        Q11,
        message,
      } = req.body;
      const newDepartment = new Department({
        userName,
        employeeName,
        workPlace,
        Q1,
        Q2,
        Q3,
        Q4,
        Q5,
        Q6,
        Q7,
        Q8,
        Q9,
        Q10,
        Q11,
        message,
      });
      await newDepartment.save();

      // Log successful department creation
      await logAction(
        req,
        res,
        "department",
        "createDepartment",
        "Create department evaluation",
        "success",
        null,
        { departmentId: newDepartment._id, employeeName }
      );

      res.json({ message: "Department created successfully" });
    } catch (error) {
      // Log failed department creation
      await logAction(
        req,
        res,
        "department",
        "createDepartment",
        "Create department evaluation",
        "failure",
        error.message,
        { employeeName: req.body?.employeeName }
      );

      res.status(500).json({ message: "Failed to create Department", error });
    }
  },
  fetchDepartment: async (req, res) => {
    try {
      // Find documents that match the name parameter and select only the name and age fields
      const Departments = await Department.find({}).select(
        "userName employeeName workPlace Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 Q10 Q11 message createdAt updatedAt"
      );

      // Log successful department fetch
      await logAction(
        req,
        res,
        "department",
        "fetchDepartment",
        "Fetch all department evaluations",
        "success",
        null,
        { count: Departments.length }
      );

      // Send the filtered results as JSON
      res.json(Departments);
    } catch (error) {
      // Log failed department fetch
      await logAction(
        req,
        res,
        "department",
        "fetchDepartment",
        "Fetch all department evaluations",
        "failure",
        error.message
      );

      // Send an error response if the query fails
      res
        .status(500)
        .json({ message: "Failed to fetch Department", error: error });
    }
  },
};
