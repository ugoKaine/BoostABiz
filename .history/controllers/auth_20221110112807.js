const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const { validationResult } = require("express-validator");

const User = require("../models/user");

var transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: "hopealivepharmacy@gmail.com",
    pass: "xxydqhojlfqhgmxz",
  },
});

// Get

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", { errorMessage: req.flash("error") });
};

exports.getCreateUser = (req, res, next) => {
  res.render("auth/createUser", {
    errorMessage: req.flash("error"),
    oldInput: {
      firstname: "",
      lastname: "",
      username: "",
      password: "",
    },
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/emailConfirm", { errorMessage: req.flash("error") });
};

// Post
exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid Email.");
        return res.redirect("/");
      }
      bcrypt
        .compare(password, user.password)
        .then((passwordMatch) => {
          if (passwordMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.render("user/index");
            });
          }
          req.flash("error", "Incorrect Password.");
          return res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

exports.postCreateUser = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const role = req.body.role;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/createUser", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
      },
    });
  }

  User.findOne({ username: username })
    .then((userExists) => {
      if (userExists) {
        req.flash("error", "email already exist.");
        return res.redirect("/createuser");
      }
      if (password !== confirmPassword) {
        req.flash("error", "password have to match.");
        return res.redirect("/createuser");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            username: username,
            password: hashedPassword,
            firstname: firstname,
            lastname: lastname,
            role: role,
          });
          return user.save();
        })
        .then((result) => {
          if (result) {
            req.flash("error", "User created successfully.");
            res.redirect("/createuser");
          }
        });
    })
    .catch((err) => {
      if (err) {
        console.log(err);
      }
    });
};

exports.postEmail = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const username = req.body.username;
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          req.flash("error", "No User With This Email.");
          res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        console.log(user + " : " + token);
        return user.save();
      })
      .then((result) => {
        res.render("auth/passwordReset", {
          username: username,
          errorMessage: req.flash("error"),
        });
        transporter.sendMail({
          from: "hopealivepharmacy@gmail.com",
          to: username,
          subject: "You Requested for a password change",
          text: "Copy this token to effect your password change " + token,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postResetPassword = (req, res, next) => {
  const username = req.body.username;
  const passwordToken = req.body.token;
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/passwordReset", {
      username: username,
      errorMessage: errors.array()[0].msg,
    });
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    username: username,
  })
    .then((user) => {
      // if (!user) {
      //   req.flash("error", "Invalid Token.");
      //   return res.redirect("/resetPass", { username: username });
      // }
      if (newPassword !== confirmPassword) {
        req.flash("error", "Password do not Match");
        res.redirect("/resetE", { username: username });
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      console.log("succesful");
      req.flash("error", "Log in with your new password");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
