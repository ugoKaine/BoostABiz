const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.postLogin = (req, res, next) => {
  res.render("user/index");
};
exports.postReceipt = (req, res, next) => {
  const receipt = new Receipt({
    receiptField: req.body.sales,
    grandTotal: req.body.grandTotal,
    username: req.user.username,
  });
  receipt.save();
  receipt.forEach((r) => {
    r.forEach((sale) => {
      Receipt.find({ title: sale.item }).then((foundItem) => {
        foundItem.quantity -= sale.quantity;
      });
      foundItem.save().then((result) => {
        console.log(result);
      });
      res.send("done and dusted").catch((err) => {
        if (err) {
          console.log(err);
        }
      });
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
