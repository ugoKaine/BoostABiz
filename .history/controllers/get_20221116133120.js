const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.getStore = (req, res, next) => {
  const role = req.session.user.role;
  if (role !== "admin") {
    req.session.destroy();
    return res.redirect("/");
  }
  Product.find({})
    .sort("title")
    .then((product) => {
      if (product) {
        res.render("admin/store", { prod: product, role: role });
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
      }
    });
};

exports.getReceipt = (req, res, next) => {
  const role = req.session.user.role;
  dataL = [];
  Product.find({})
    .then((product) => {
      if (product) {
        product.forEach((p) => {
          dataL.push(p.title);
        });

        dataL.sort();
        res.render("user/generateReceipt", { prod: dataL, role: role });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddproduct = (req, res, next) => {
  const role = req.session.user.role;
  if (role !== "admin") {
    req.session.destroy();
    return res.redirect("/");
  }
  dataL = [];
  Product.find({})
    .then((product) => {
      if (product) {
        product.forEach((p) => {
          dataL.push(p.title);
        });
        dataL.sort();
        console.log(dataL);
        res.render("admin/addproduct", {
          prod: dataL,
          role: role,
          errorMessage: req.flash("error"),
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSales = (req, res, next) => {
  const role = req.session.user.role;
  if (role !== "admin") {
    req.session.destroy();
    return res.redirect("/");
  }
  TotalS = 0;
  Receipt.find({
    createdAt: {
      $gte: new Date(new Date().setHours(23, 59, 59, 999)) - 8.64e7,
    },
  })
    .sort({ createdAt: -1 })
    .then((receipt) => {
      receipt.forEach((rep) => {
        TotalS += rep.grandTotal;
      });
      res.render("admin/checkUser", {
        receipt: receipt,
        totalSales: TotalS,
        role: role,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getproducts = (req, res, next) => {
  const role = req.session.user.role;
  if (role !== "admin") {
    req.session.destroy();
    return res.redirect("/");
  }
  res.render("admin/products", { role: role });
};

exports.getCheckUser = (req, res, next) => {
  const role = req.session.user.role;
  if (role !== "admin") {
    req.session.destroy();
    return res.redirect("/");
  }
  res.render("admin/checkUser", { role: role });
};

exports.getIndex = (req, res, next) => {
  const role = req.session.user.role;
  res.render("user/index", { role: role });
};

exports.getHome = (req, res, next) => {
  const role = req.session.user.role;
  res.render("user/index", { role: role });
};
