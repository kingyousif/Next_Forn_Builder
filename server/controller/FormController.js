// controller/FormController.js
const userModel = require("../model/user.model");
const Form = require("../model/FormModel");
const {
    logAction
} = require("../utils/loggingService");

// CommonJS syntax
module.exports = {
    // At the top of the file

    // Inside the createForm method
    createForm: async (req, res) => {
        try {
            const {
                title,
                description,
                direction,
                elements,
                active,
                settings,
                createdBy,
                department: requestedDepartment,
                percentage,
                highestScore,
            } = req.body;

            // Use findOne instead of find to get a single document
            const user = await userModel.findOne({
                name: createdBy,
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // Check if role is admin
            if (user.role !== "admin") {
                return res.status(403).json({
                    message: "Only admin users can access",
                });
            }

            // Determine the department
            let finalDepartment = requestedDepartment;
            if (user.department !== "HR" && user.department !== "Media") {
                finalDepartment = user.department;
            }

            const newForm = new Form({
                title,
                description,
                direction,
                elements,
                active,
                settings,
                createdBy,
                department: finalDepartment,
                percentage,
                highestScore,
            });

            await newForm.save();

            // Log successful form creation
            await logAction(
                req,
                res,
                "form",
                "createForm",
                "Create form",
                "success",
                null, {
                    formId: newForm._id,
                    title: newForm.title,
                    department: finalDepartment,
                }
            );

            res.json({
                message: "Form created successfully",
            });
        } catch (error) {
            // Log failed form creation
            // await logAction(
            //     req,
            //     res,
            //     "form",
            //     "createForm",
            //     "Create form",
            //     "failure",
            //     error.message, {
            //         title: req.body ? .title,
            //         department: req.body ? .department
            //     }
            // );

            console.error("Form creation error:", error);
            res.status(500).json({
                message: "Failed to create Form",
                error: error.message,
            });
        }
    },
    updateForm: async (req, res) => {
        try {
            const {
                _id,
                title,
                description,
                direction,
                elements,
                active,
                settings,
                updatedBy,
                createdBy,
                department: requestedDepartment,
                percentage,
                highestScore,
            } = req.body;

            // Ensure `id` is provided
            if (!_id) {
                return res.status(400).json({
                    message: "ID is required",
                });
            }
            // Use findOne instead of find to get a single document
            const user = await userModel.findOne({
                name: createdBy,
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // Check if role is admin
            if (user.role !== "admin") {
                return res.status(403).json({
                    message: "Only admin users can access",
                });
            }

            // Determine the department
            let finalDepartment = requestedDepartment;
            if (user.department !== "HR" && user.department !== "Media") {
                finalDepartment = user.department;
            }

            // Find and update the document
            const update = await Form.findOneAndUpdate({
                    _id: _id,
                }, // ✅ Correct filter format
                {
                    title,
                    description,
                    direction,
                    elements,
                    active,
                    settings,
                    updatedBy,
                    createdBy,
                    department: finalDepartment,
                    percentage,
                    highestScore,
                }, {
                    new: true,
                } // ✅ Returns updated document
            );

            if (!update) {
                return res.status(404).json({
                    message: "Form not found",
                });
            }

            res.json({
                message: "Form updated successfully",
                update,
            });
        } catch (error) {
            res.status(500).json({
                message: "Failed to update Form",
                error: error.message,
            });
        }
    },
    fetchForm: async (req, res) => {
        try {
            const {
                id
            } = req.params;

            // First check if the user with provided id exists
            const user = await userModel.findById(id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // Get name and role from user
            const {
                name,
                role
            } = user;

            let Forms;

            if (user.role === "super admin") {
                // Retrieve filtered documents where createdBy matches user's name
                Forms = await Form.find({});
            } else {
                // Retrieve filtered documents where createdBy matches user's name
                if (role !== "admin" && role !== "super admin" && role !== "user") {
                    return res.status(403).json({
                        message: "Only admin users can access",
                    });
                }
                if (role === "admin") {
                    Forms = await Form.find({
                        createdBy: name,
                    });
                } else {
                    Forms = await Form.find({});
                    console.log(Forms);
                }
            }

            // Send the filtered data as response
            res.json(Forms);
        } catch (error) {
            // Handle errors
            res.status(500).json({
                message: "Failed to fetch Form",
                error: error.message,
            });
        }
    },

    fetchOneForm: async (req, res) => {
        try {
            // Find documents that match the id parameter and select all fields
            const Forms = await Form.findOne({
                _id: req.params.id,
            });

            if (!Forms) {
                return res.status(404).json({
                    message: "Form not found",
                });
            }

            // Send the filtered results as JSON
            res.json(Forms);
        } catch (error) {
            // Send an error response if the query fails
            res.status(500).json({
                message: "Failed to fetch Form",
                error: error,
            });
        }
    },
    FormActive: async (req, res) => {
        try {
            const {
                department,
                userDepartment,
                user
            } = req.body;
            console.log("User department:", userDepartment);
            // Check if department matches userDepartment, otherwise use userDepartment
            const departments =
                department && department === userDepartment ?
                department :
                userDepartment;
            const name = user;

            console.log("Departments:", departments);

            // First set all forms to inactive
            await Form.updateMany({
                createdBy: name,
            }, {
                active: false,
            });

            // Then set the selected form to active
            const updatedForm = await Form.findByIdAndUpdate(
                req.params.id, {
                    active: true,
                }, {
                    new: true,
                }
            );

            if (!updatedForm) {
                return res.status(404).json({
                    message: "Form not found",
                });
            }

            // Return a success response
            return res.status(200).json({
                message: "Form activation status updated successfully",
                updatedForm,
            });
        } catch (error) {
            // Send an error response if the query fails
            res.status(500).json({
                message: "Failed to update Form",
                error: error.message,
            });
        }
    },

    deleteForm: async (req, res) => {
        try {
            const deleteForm = await Form.findByIdAndDelete({
                _id: req.params.id,
            });
            if (!deleteForm) {
                return res.status(404).json({
                    message: "Form not found",
                });
            }
            res.json({
                message: "Form deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete Form",
                error: error.message,
            });
        }
    },
};