const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
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
  res.render("auth/createUser", { errorMessage: req.flash("error") });
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
  User.findOne({ username: username })
    .then((userExists) => {
      if (userExists) {
        req.flash("error", "emai already exist.");
        return res.redirect("/createuser");
      }
      if (password !== confirmPassword) {
        req.flash("error", "password and confirm password do not match.");
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

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    username: username,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid Token.");
        res.redirect("/resetE", { username: username });
      }
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
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
