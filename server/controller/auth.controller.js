const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const {
  generateTokenAndSetCookie,
} = require("../utils/generateTokenAndSetCookie.js");

const User = require("../model/user.model.js");
// Add this line to import the logging service
const { logAction } = require("../utils/loggingService.js");

module.exports = {
  signup: async (req, res) => {
    const { name, fullName, phone, password, role, department } = req.body;

    try {
      if (!fullName || !password || !name || !role || !department) {
        // Log the failed attempt
        await logAction(
          req,
          res,
          "auth",
          "signup",
          "User signup attempt",
          "failure",
          "Missing required fields"
        );
        return res
          .status(400)
          .json({ success: false, message: "Please fill all the fields" });
      }

      const userAlreadyExists = await User.findOne({ name });

      if (userAlreadyExists) {
        // Log the failed attempt
        await logAction(
          req,
          res,
          "auth",
          "signup",
          "User signup attempt",
          "failure",
          "User already exists"
        );
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
      const userFullNameExists = await User.findOne({ fullName });
      if (userFullNameExists) {
        // Log the failed attempt
        await logAction(
          req,
          res,
          "auth",
          "signup",
          "User signup attempt",
          "failure",
          "User already exists"
        );
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const user = new User({
        phone,
        role,
        department,
        fullName,
        password: hashedPassword,
        name,
        // verificationToken,
        // verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      await user.save();

      // jwt
      generateTokenAndSetCookie(res, user._id);

      // Log the successful signup
      await logAction(
        req,
        res,
        "auth",
        "signup",
        "User created",
        "success",
        null,
        {
          userId: user._id,
          userName: user.fullName,
          userRole: user.role,
          department: user.department,
        }
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        // user: {
        //   ...user._doc,
        //   password: undefined,
        // },
      });
    } catch (error) {
      // Log the error
      await logAction(
        req,
        res,
        "auth",
        "signup",
        "User signup attempt",
        "failure",
        error.message
      );
      res.status(400).json({ success: false, message: error.message });
    }
  },

  verifyEmail: async (req, res) => {
    const { code } = req.body;
    try {
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
      await user.save();

      // await sendWelcomeEmail(user.email, user.name);

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      console.log("error in verifyEmail ", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  login: async (req, res) => {
    let { name, password } = req.body;
    try {
      // Check if any users exist in the database
      const userCount = await User.countDocuments();

      // If no users exist, create default admin user
      if (userCount === 0) {
        const hashedPassword = await bcryptjs.hash("12345678", 10);
        const defaultUser = new User({
          name: "yousif",
          password: hashedPassword,
          role: "super admin",
          department: "None",
          fullName: "yousif ali hasan",
        });
        await defaultUser.save();
      }

      name = name.toLowerCase();

      const user = await User.findOne({ name });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Name or password is incorrect" });
      }

      user.lastLogin = new Date();
      user.token = generateTokenAndSetCookie(res, user._id);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      console.log("Error in login ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  logout: async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetTokenExpiresAt;

      await user.save();

      // send email
      await sendPasswordResetEmail(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      console.log("Error in forgotPassword ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }

      // update password
      const hashedPassword = await bcryptjs.hash(password, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();

      await sendResetSuccessEmail(user.email);

      res
        .status(200)
        .json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.log("Error in resetPassword ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  checkAuth: async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user.token || !user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.log("Error in checkAuth", error);
      res.status(200).json({
        success: false,
        authenticated: false,
        message: "Internal server error",
      });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      // Find the user by ID (from token)
      const user = await User.findById(req.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await bcryptjs.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update the password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.log("Error in changePassword", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
