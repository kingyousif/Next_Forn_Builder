const express = require("express");
const {
  fetchUsers,
  updateUsers,
  deleteUsers,
  fetchUsersDepartment,
  fetchUsersById,
  fetchOneUsersDepartment,
  fetchUsersDepartmentForSwaping,
} = require("../controller/users.Controller");
const { signup } = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

router.post("/create", signup);
router.post("/fetch", fetchUsers);
router.post("/fetchById", fetchUsersById);
router.post("/fetchForDepartment", fetchUsersDepartment);
router.post(
  "/fetchForDepartmentForSwap",
  verifyToken,
  fetchUsersDepartmentForSwaping
);
router.post("/fetchOneUser", fetchOneUsersDepartment);
router.put("/update/:id", updateUsers);
router.delete("/delete/:id", deleteUsers);

module.exports = router;
