const CryptoJS = require("crypto-js");

// Use a strong secret key - in production, this should be from environment variables
const SECRET_KEY = "Yousif@123";

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

const originalDate = "01-01-2025";
const encryptedDate = encryptData(originalDate);

