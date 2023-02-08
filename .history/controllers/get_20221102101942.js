const Product = require("../models/store");

exports.getLogin = (req, res, next) => {
  res.render("auth/login");
};

exports.getReceipt = (req, res, next) => {
  res.render("user/generateReceipt");
};
exports.getAddproduct = (req, res, next) => {
  Product.find({})
    .then((product) => {
      if (product) {
        res.render("admin/addproduct", { prod: product });
      }
      res.render("admin/addproduct", { prod: "" });
    })
    .catch((err) => {
      console.log(err);
    });
  res.render("admin/addproduct");
};
exports.getproducts = (req, res, next) => {
  res.render("admin/products");
};

exports.getCreateUser = (req, res, next) => {
  res.render("admin/createUser");
};
exports.getCheckUser = (req, res, next) => {
  res.render("admin/checkUser");
};
exports.getIndex = (req, res, next) => {
  res.render("user/index");
};
