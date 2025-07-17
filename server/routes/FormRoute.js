const express = require("express");
const { logMiddleware } = require("../utils/loggingService");
const { verifyToken } = require("../middleware/verifyToken");
const {
  createForm,
  updateForm,
  fetchForm,
  fetchOneForm,
  FormActive,
  deleteForm,
} = require("../controller/FormController");

const router = express.Router();

// Apply logging middleware to routes
router.post(
  "/create",
  // verifyToken,
  // logMiddleware("form", "createForm", "Create form"),
  createForm
);

router.put(
  "/",
  // verifyToken,
  // logMiddleware("form", "updateForm", "Update form"),
  updateForm
);

router.get(
  "/",
  // verifyToken,
  // logMiddleware("form", "fetchForm", "Fetch forms"),
  fetchForm
);

router.get("/fetch/:id", fetchForm);
router.put("/fetchActive/:id", FormActive);
router.post("/update", updateForm);
router.get("/fetchone/:id", fetchOneForm);
router.delete("/delete/:id", deleteForm);

module.exports = router;
