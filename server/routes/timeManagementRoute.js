const express = require("express");
const {
  createTimeManagement,
  fetchTimeManagement,
  deleteTimeManagement,
  updateTimeManagement,
  checkUserAvailability,
} = require("../controller/TimeManagementContoller");

const router = express.Router();

router.post("/create", createTimeManagement);
router.delete("/delete", deleteTimeManagement);
router.post("/fetch", fetchTimeManagement);
router.put("/update/:id", updateTimeManagement);
router.post("/checkUserAvailability", checkUserAvailability);

module.exports = router;
