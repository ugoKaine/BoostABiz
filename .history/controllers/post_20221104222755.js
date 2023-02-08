const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.postReceipt = (req, res, next) => {
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
      })
      return product.save();
      .then((result) => {
        console.log("UPDATED PRODUCT!");
        // res.redirect("/admin/receipt");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const quantity = req.body.quantity;
  Product.findOne({ title: title })
    .then((product) => {
      if (product) {
        product.quantity += parseInt(quantity);
        return product.save().then((result) => {
          console.log("UPDATED PRODUCT!");
          res.redirect("/addproduct");
        });
      } else {
        const product = new Product({
          title: title,
          quantity: quantity,
        });
        product.save().then((result) => {
          console.log(result);
          console.log("Created Product");
          res.redirect("/addproduct");
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/products");
    });
};
