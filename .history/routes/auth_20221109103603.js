const path = require("path");

const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is_Auth");

const router = express.Router();

// Get
router.get("/createuser", isAuth, authController.getCreateUser);
router.get("/", authController.getLogin);
router.get("/logout", authController.getLogout);
router.get("/reset", authController.getReset);
router.get("/resetPass", authController.getPasswordReset);

// Post
router.post(
  "/createuser",
  [
    check("username")
      .isEmail()
      .withMessage("Please Enter a valid Email address")
      .normalizeEmail(),
    check("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long")
      .trim(),
  ],

  isAuth,
  authController.postCreateUser
);
router.post("/login", authController.postLogin);
router.post("/resetE", authController.postEmail);
router.post("/token", authController.postResetPassword);

module.exports = router;
