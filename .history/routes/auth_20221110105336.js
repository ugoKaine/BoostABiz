const path = require("path");

const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is_Auth");
const User = require("../models/user");

const router = express.Router();

// Get
router.get("/createuser", isAuth, authController.getCreateUser);
router.get("/", authController.getLogin);
router.get("/logout", authController.getLogout);
router.get("/reset", authController.getReset);

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
router.post("/resetE", authController.postEmail),
  router.post(
    "/token",
    check("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long"),
    check("username", "resetToken", "resetTokenExpiration").custom(=> {
        return User.findOne({
          resetToken: passwordToken,
          resetTokenExpiration: { $gt: Date.now() },
          username: username,
        }).then((user) => {
          if (!user) {
            return Promise.reject("Invalid Token");
          }
        });
      }
    ),

    authController.postResetPassword
  );

module.exports = router;
