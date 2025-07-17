const express = require("express");

const {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  changePassword,
} = require("../controller/auth.controller.js");
const { verifyToken } = require("../middleware/verifyToken.js");
// Add this line to import the logging middleware
const { logMiddleware } = require("../utils/loggingService.js");

const router = express.Router();

router.post("/check-auth", verifyToken, checkAuth);

router.post("/signup", logMiddleware("auth", "signup", "User signup"), signup);
router.post("/login", logMiddleware("auth", "login", "User login"), login);
router.post("/logout", logMiddleware("auth", "logout", "User logout"), logout);

router.post(
  "/verify-email",
  logMiddleware("auth", "verifyEmail", "Verify email"),
  verifyEmail
);
router.post(
  "/forgot-password",
  logMiddleware("auth", "forgotPassword", "Forgot password"),
  forgotPassword
);

router.post(
  "/reset-password/:token",
  logMiddleware("auth", "resetPassword", "Reset password"),
  resetPassword
);
router.post(
  "/change-password",
  verifyToken,
  logMiddleware("auth", "changePassword", "Change password"),
  changePassword
);

module.exports = router;
