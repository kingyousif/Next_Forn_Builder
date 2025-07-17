const jwt = require("jsonwebtoken");

module.exports = {
  generateTokenAndSetCookie: (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None", // Allow cross-origin cookies
      secure: false, // Set to true for HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 days expiration
    });

    return token;
  },
};
