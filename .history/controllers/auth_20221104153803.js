const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Get
exports.getLogin = (req, res, next) => {
  res.render("auth/login", { errorMessage: req.flash("error") });
};

exports.getCreateUser = (req, res, next) => {
  res.render("auth/createUser", { errorMessage: req.flash("error") });
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
              console.log(err);
              res.redirect("user/index");
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
