const path = require("path");

const express = require("express");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is_Auth");

const router = express.Router();

// Get
router.get("/createuser", authController.getCreateUser);
router.get("/", authController.getLogin);

// Post
router.post("/createuser", authController.postCreateUser);
router.post("/login", authController.postLogin);

module.exports = router;
