const path = require("path");

const express = require("express");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is_Auth");

const router = express.Router();

// Get
router.get("/createuser", isAuth, authController.getCreateUser);
router.get("/", authController.getLogin);
router.get("/logout", authController.getLogout);
router.get("/reset", authController.getReset);

// Post
router.post("/createuser", isAuth, authController.postCreateUser);
router.post("/login", authController.postLogin);

module.exports = router;
