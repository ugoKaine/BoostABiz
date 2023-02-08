const Product = require("../models/store");
exports.getLogin = (req, res, next) => {
  res.render("auth/login");
};

exports.getStore = (req, res, next) => {
  Product.find({})
    .then((product) => {
      if (product) {
        res.render("admin/store", { prod: product });
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
      }
    });
};
exports.getReceipt = (req, res, next) => {
  dataL = [];
  Product.find({})
    .then((product) => {
      if (product) {
        product.forEach((p) => {
          dataL.push(p.title);
        });

        dataL.sort();
        res.render("user/generateReceipt", { prod: dataL });
      }
      // res.render("user/generateReceipt", { prod: "" });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getAddproduct = (req, res, next) => {
  dataL = [];
  Product.find({})
    .then((product) => {
      if (product) {
        product.forEach((p) => {
          dataL.push(p.title);
        });
        dataL.sort();
        console.log(dataL);
        res.render("admin/addproduct", { prod: dataL });
      }
      // res.render("admin/addproduct", { prod: "" });
    })
    .catch((err) => {
      console.log(err);
    });
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
