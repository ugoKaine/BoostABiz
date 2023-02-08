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
router.get("/resetE", authController.getPasswordReset);

// Post
router.post("/createuser", isAuth, authController.postCreateUser);
router.post("/login", authController.postLogin);
router.post("/resetE", authController.postEmail);
router.post("/token", authController.postResetPassword);

module.exports = router;
