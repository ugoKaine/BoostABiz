const path = require("path");
const PDFDocument = require("pdfkit");
const Product = require("../models/store");
const Receipt = require("../models/receipt");
const User = require("../models/user");

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
  const savedReceipt = receipt.save();
  if(savedReceipt){
    const invoiceName = "invoice-" + receipt._id + ".pdf";
  const invoicePath = path.join("./data", "invoices", invoiceName);

  const pdfDoc = new PDFDocument({ margin: 10 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );

  pdfDoc.pipe(res);

  pdfDoc.text(new Date().toString().substring(0, 25));
  pdfDoc.fontSize(30).text("EPHRE KINGS PHARMACY", { align: "center" });
  pdfDoc
    .fontSize(20)
    .text("Live Healthy & Happily", {
      align: "center",
    });
  pdfDoc.fontSize(20).text("79B Modupe Young Street, Thomas Estate, Ajah, Lagos", { align: "center" });

  pdfDoc.fontSize(20).text("Item", 10, 150, { width: 190 });
  pdfDoc.fontSize(20).text("Qty", 280, 150, { width: 100 });
  pdfDoc.fontSize(20).text("Price", 330, 150, { width: 100 });
  pdfDoc.fontSize(20).text("Total Price", 410, 150, { width: 190 });
  pdfDoc.fontSize(20).text("");

  let productNo = 1;

  receipt.receiptField.forEach(function (sale) {
    let y = 150 + productNo * 20;
    pdfDoc.fontSize(15).text(sale.item, 10, y, { width: 250 });
    pdfDoc.text(sale.quantity, 280, y, { width: 100 });
    pdfDoc.fontSize(15).text(sale.price, 330, y, { width: 100 });
    pdfDoc.fontSize(15).text(sale.total, 410, y, { width: 190 });
    productNo++;
  });
  pdfDoc
    .rect(7, 150 + productNo * 30, 560, 0.2)
    .fillColor("#000")
    .stroke("#000");
  productNo++;

  pdfDoc.text("Grand Total:", 310, 160 + productNo * 30).moveDown();
  pdfDoc.text(receipt.grandTotal, 410, 160 + productNo * 30).moveDown();
  pdfDoc
    .fontSize(20)
    .text("Thanks for your patronage!", 0, 250 + productNo * 30, {
      align: "center",
    });
  pdfDoc.text("For your Online And Offline Purchase of Medicines,beauty & Fitness Essentials...", {
    align: "center",
  });
  pdfDoc.text("Contact Us @ Tel:07083732625 or ephrekingscompanies@gmail.com", {
    align: "center",
  });
  pdfDoc.end();

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
  }
  else{res.redirect("/")}
};

exports.postAddProduct = (req, res, next) => {
  const role = req.session.user.role;
  const title = req.body.title;
  const quantity = req.body.quantity;
  const price = req.body.price;
  Product.findOne({ title: title })
    .then((product) => {
      if (product) {
        if(quantity && price){
          product.quantity += parseInt(quantity);
          product.price = parseInt(price);
        }
        else if(quantity){
          product.quantity += parseInt(quantity);
        }
        
        else if(price){
          product.price = parseInt(price);
        }
        
        return product.save().then((result) => {
          req.flash(
            "error",
            "Updated Product " + title 
          );

          res.redirect("/products");
        });
      } else {
        const product = new Product({
          title: title,
          quantity: quantity,
          price: price,
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
  if (payment) {
    query.paymentMethod = payment;
  }
  if (cashier) {
    query.username = cashier;
  }
  if (req.session.user.role == "admin") {
    Receipt.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .find(query)
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

exports.postDelete = (req, res, next) => {
  const checkbox = req.body.checkbox;
  User.findByIdAndRemove({ _id: checkbox })
    .then((result) => {
      // console.log("deleted");
      res.redirect("/users");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteP = (req, res, next) => {
  const checkbox = req.body.checkbox;
  Product.findByIdAndRemove({ _id: checkbox })
    .then((result) => {
      // console.log("Product deleted");
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
