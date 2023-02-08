const Product = require("../models/store");
const Receipt = require("../models/receipt");

exports.postLogin = (req, res, next) => {
  res.render("user/index");
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const quantity = req.body.quantity;
  Product.findOne({ title: title })
    .then((product) => {
      if (product) {
        product.quantity += quantity;
        return product.save().then((result) => {
          console.log("UPDATED PRODUCT!");
          res.redirect("/addproduct");
        });
      } else {
        product = new Product({
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
