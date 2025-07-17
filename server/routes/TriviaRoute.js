const express = require("express");
const { createTrivia, fetchTrivia } = require("../controller/TriviaController");

const router = express.Router();

router.post("/create", createTrivia);
router.post("/fetch", fetchTrivia);

module.exports = router;
