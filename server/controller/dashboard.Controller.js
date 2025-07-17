const userModel = require("../model/user.model");
const formModel = require("../model/FormModel");
const submissionModel = require("../model/formSubmissionModel");

module.exports = {
  // Get dashboard data based on user role
  getDashboardData: async (req, res) => {
    try {
      const userId = req.userId;
      const user = await userModel
        .findById(userId)
        .select("role department fullName name");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let dashboardData = {};

      // User role dashboard data
      if (user.role === "user") {
        // Get submissions for this user
        const userSubmissions = await submissionModel
          .find({
            createdFor: user.name,
          })
          .populate("formId", "title");

        // Calculate total scores from submissions
        const totalScores = userSubmissions.reduce(
          (sum, submission) => sum + (submission.score || 0),
          0
        );

        // Calculate average percentage across all submissions
        const totalPercentage = userSubmissions.reduce(
          (sum, submission) => sum + (submission.percentage || 0),
          0
        );
        const avgPercentage =
          userSubmissions.length > 0
            ? totalPercentage / userSubmissions.length
            : 0;

        // Count total submissions
        const submissionCount = userSubmissions.length;

        // Get recent form submissions (5)
        const recentSubmissions = await submissionModel
          .find({ createdFor: user.name })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("formId", "title");

        dashboardData = {
          totalScores,
          averagePercentage: avgPercentage.toFixed(2),
          submissionCount,
          recentSubmissions,
        };
      }
      // Admin role dashboard data
      else if (user.role === "admin") {
        // Count employees in this admin's department
        const employeeCount = await userModel.countDocuments({
          department: user.department,
          role: "user",
        });

        // Count forms created by this admin
        const formsCreated = await formModel.countDocuments({
          createdBy: user.name,
        });

        // Get forms created by this admin
        const adminForms = await formModel.find({
          createdBy: user.name,
        });

        const formIds = adminForms.map((form) => form._id);

        // Count submissions for forms created by this admin
        const submissionCount =
          formIds.length > 0
            ? await submissionModel.countDocuments({
                formId: { $in: formIds },
              })
            : 0;

        // Calculate total scores given to users
        let totalScoresGiven = 0;
        if (formIds.length > 0) {
          const scoresAggregation = await submissionModel.aggregate([
            { $match: { formId: { $in: formIds } } },
            { $group: { _id: null, totalScore: { $sum: "$score" } } },
          ]);

          if (scoresAggregation.length > 0) {
            totalScoresGiven = scoresAggregation[0].totalScore;
          }
        }

        // Get recent form submissions (5)
        const recentSubmissions =
          formIds.length > 0
            ? await submissionModel
                .find({ formId: { $in: formIds } })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("formId", "title")
                .populate("userId", "fullName")
            : [];

        dashboardData = {
          employeeCount,
          formsCreated,
          submissionCount,
          totalScoresGiven,
          recentSubmissions,
        };
      }
      // Super admin role dashboard data
      else if (user.role === "super admin") {
        // Count all forms
        const totalForms = await formModel.countDocuments();

        // Count all submissions
        const totalSubmissions = await submissionModel.countDocuments();

        // Count all employees (users only)
        const totalEmployees = await userModel.countDocuments({ role: "user" });

        // Calculate total scores given to all users
        let totalScoresGiven = 0;
        const scoresAggregation = await submissionModel.aggregate([
          { $group: { _id: null, totalScore: { $sum: "$score" } } },
        ]);

        if (scoresAggregation.length > 0) {
          totalScoresGiven = scoresAggregation[0].totalScore;
        }

        // Get recent forms created by admins (5)
        const recentForms = await formModel
          .find({ createdBy: { $ne: userId } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("createdBy", "fullName department");

        dashboardData = {
          totalForms,
          totalSubmissions,
          totalEmployees,
          totalScoresGiven,
          recentForms,
        };
      } else {
        return res
          .status(403)
          .json({ success: false, message: "Invalid role" });
      }

      return res.status(200).json({
        success: true,
        dashboardData,
      });
    } catch (error) {
      console.log("Error in getDashboardData", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
