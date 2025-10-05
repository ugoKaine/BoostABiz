const path = require("path");
const PDFDocument = require("pdfkit");
const Product = require("../models/store");
const Receipt = require("../models/receipt");
const User = require("../models/user");

const { validationResult } = require("express-validator");

exports.postReceipt = async (req, res, next) => {
  try {
    const role = req.session.user.role;
    const receiptF = req.body.sales;
    console.log("Incoming receipt body:", req.body);

    // ✅ STEP 1: Validate stock first
    for (const sale of receiptF) {
      const product = await Product.findOne({ title: sale.item });

      if (!product) {
        return res.status(400).json({
          message: `Product "${sale.item}" not found in store.`,
        });
      }

      if (product.quantity < sale.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${sale.item}". Only ${product.quantity} left in store.`,
        });
      }
    }

    // ✅ STEP 2: Deduct stock only if all are valid
    for (const sale of receiptF) {
      await Product.updateOne(
        { title: sale.item },
        { $inc: { quantity: -sale.quantity } }
      );
    }

    // ✅ STEP 3: Save the receipt
    const receipt = new Receipt({
      receiptField: req.body.sales,
      grandTotal: req.body.grandTotal,
      paymentMethod: req.body.payment,
      username: req.session.user.username,
      lastname: req.session.user.lastname,
      firstname: req.session.user.firstname,
      customerName: req.body.customerName || "",
      phoneNumber: req.body.phoneNumber || "",
      address: req.body.address || "",
    });

    const savedReceipt = await receipt.save();

    // ✅ STEP 4: Generate PDF
    const invoiceName = "invoice-" + savedReceipt._id + ".pdf";
    const invoicePath = path.join("./data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument({ margin: 10 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
    pdfDoc.pipe(res);

    pdfDoc.text(new Date().toString().substring(0, 25));
    pdfDoc.fontSize(30).text("Boosta Biz", { align: "center" });
    pdfDoc.fontSize(20).text("BoostA Biz, Unity Estate Alimosho, Lagos", { align: "center" });

    // Customer details
    pdfDoc.moveDown();
    pdfDoc.fontSize(16).text("Customer Name: " + savedReceipt.customerName);
    pdfDoc.fontSize(16).text("Phone Number: " + savedReceipt.phoneNumber);
    pdfDoc.fontSize(16).text("Address: " + savedReceipt.address);
    pdfDoc.moveDown();

    // Table headers
    pdfDoc.fontSize(20).text("Item", 10, 200, { width: 190 });
    pdfDoc.text("Qty", 280, 200, { width: 100 });
    pdfDoc.text("Price", 330, 200, { width: 100 });
    pdfDoc.text("Total Price", 410, 200, { width: 190 });

    let productNo = 1;
    savedReceipt.receiptField.forEach((sale) => {
      let y = 200 + productNo * 20;
      pdfDoc.fontSize(15).text(sale.item, 10, y, { width: 250 });
      pdfDoc.text(sale.quantity, 280, y, { width: 100 });
      pdfDoc.text(sale.price, 330, y, { width: 100 });
      pdfDoc.text(sale.total, 410, y, { width: 190 });
      productNo++;
    });

    // Grand total
    pdfDoc
      .rect(7, 200 + productNo * 30, 560, 0.2)
      .fillColor("#000")
      .stroke("#000");
    productNo++;
    pdfDoc.text("Grand Total:", 310, 210 + productNo * 30).moveDown();
    pdfDoc.text(savedReceipt.grandTotal, 410, 210 + productNo * 30).moveDown();

    pdfDoc
      .fontSize(20)
      .text("Thanks for your patronage!", 0, 300 + productNo * 30, {
        align: "center",
      });
    pdfDoc.text("Contact Us @ Tel:08109811669 or support@boosta.ng", {
      align: "center",
    });
    pdfDoc.end();

  } catch (err) {
    console.error("Error saving receipt:", err);
    res.status(500).json({ message: "Server error generating receipt" });
  }
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

  let query = {};
  let dateFilter = {};

  // Only add date filter if provided
  if (req.body.startDate && req.body.endDate) {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    endDate.setDate(endDate.getDate() + 1);

    dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }

  // Optional filters
  if (payment) {
    query.paymentMethod = payment;
  }
  if (cashier) {
    query.username = cashier;
  }

  if (role === "admin") {
    Receipt.find(dateFilter)
      .find(query)
      .sort({ createdAt: -1 })
      .then((receipts) => {
        if (!receipts) {
          return res.redirect("/");
        }

        receipts.forEach((r) => {
          Total += r.grandTotal;
        });

        // Get all cashiers for dropdown
        User.find()
          .then((users) => {
            const userL = users.map((u) => u.username);

            res.render("admin/checkUser", {
              receipt: receipts,
              totalSales: Total,
              role: role,
              u: userL, // send usernames to EJS
            });
          })
          .catch((err) => {
            console.log("Error fetching users:", err);
            res.redirect("/");
          });
      })
      .catch((err) => {
        console.log("Error fetching receipts:", err);
        res.redirect("/");
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
