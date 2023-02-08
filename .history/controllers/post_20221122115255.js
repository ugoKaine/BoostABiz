const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.postReceipt = (req, res, next) => {
  const role = req.session.user.role;
  const receiptF = req.body.sales;
  const receipt = new Receipt({
    receiptField: req.body.sales,
    grandTotal: req.body.grandTotal,
    paymentMethod: req.body.payment,
    username: req.session.user.username,
    lastname: req.session.user.lastname,
    firstname: req.session.user.firstname,
  });
  receipt.save();
  receiptF.forEach((sale) => {
    Product.findOne({ title: sale.item })
      .then((product) => {
        product.quantity -= parseInt(sale.quantity);
        product.title = product.title;
        product.save();
      })
      .then((result) => {
        console.log("UPDATED PRODUCT!");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postAddProduct = (req, res, next) => {
  const role = req.session.user.role;
  const title = req.body.title;
  const quantity = req.body.quantity;
  Product.findOne({ title: title })
    .then((product) => {
      if (product) {
        product.quantity += parseInt(quantity);
        return product.save().then((result) => {
          req.flash(
            "error",
            "Updated Product " + title + " by " + " a quantity of " + quantity
          );

          res.redirect("/products");
        });
      } else {
        const product = new Product({
          title: title,
          quantity: quantity,
        });
        product.save().then((result) => {
          console.log(result);
          req.flash(
            "error",
            "Created Product " + title + " with a quantity of " + quantity
          );

          res.redirect("/products");
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/products");
    });
};

exports.postTransactions = (req, res, next) => {
  let Total = 0;
  const role = req.session.user.role;
  const cashier = req.body.cashier;
  const payment = req.body.payment;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  endDate.setDate(endDate.getDate() + 1);
  let query = {};
  let userL = [];

  if (req.session.user.role == "admin") {
    Receipt.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      $and: [{ query }],
    })
      .sort({ createdAt: -1 })
      .then((receipt) => {
        if (receipt) {
          receipt.forEach((r) => {
            Total += r.grandTotal;
          });
          User.find().then((user) => {
            if (user) {
              user.forEach((u) => {
                userL.push(u.username);
              });
            }
          });
          res.render("admin/checkUser", {
            receipt: receipt,
            totalSales: Total,
            role: role,
            u: userL,
          });
        } else {
          console.log(err);
          res.redirect("/");
        }
      });
  } else {
    res.redirect("/");
  }
};
