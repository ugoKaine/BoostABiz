const path = require("path");

const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();

// Get
router.get("/createuser", authController.getCreateUser);
router.get("/", authController.getLogin);

// Post
router.post("/createuser", authController.postCreateUser);

module.exports = router;
