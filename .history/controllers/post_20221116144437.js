const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.postReceipt = (req, res, next) => {
  const role = req.session.user.role;
  const receiptF = req.body.sales;
  const receipt = new Receipt({
    receiptField: req.body.sales,
    grandTotal: req.body.grandTotal,
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
            "UPDATED PRODUCT! " + title + " by " + " a quantity of " + quantity
          );

          res.redirect("/addproduct", { role: role });
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

          res.redirect("/addproduct", { role: role });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/products", { role: role });
    });
};
