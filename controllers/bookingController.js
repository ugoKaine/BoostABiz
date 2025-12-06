const path = require("path");
const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");
const HotelRoom = require("../models/HotelRoom");

exports.postBooking = async (req, res, next) => {
  try {
    let { bookings, customerName, phoneNumber, payment } = req.body;

    if (!bookings || !customerName || !phoneNumber || !payment) {
      return res.status(400).send("Missing required fields");
    }

    // Parse if bookings is a string (from form submission)
    if (typeof bookings === "string") {
      bookings = JSON.parse(bookings);
    }

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).send("No bookings found");
    }

    let savedBookings = [];

    for (const b of bookings) {
      const room = await HotelRoom.findOne({ name: b.room });
      if (!room) return res.status(400).send(`Room ${b.room} not found`);
      if (!room.available) return res.status(400).send(`Room ${b.room} is not available`);

      const newBooking = new Booking({
        room: room._id,
        customerName,
        customerPhone: phoneNumber,
        checkIn: new Date(),
        totalPrice: b.total,
        paymentMethod: payment,
        quantity: 1,
        paymentStatus: "pending",
        isActive: true,
        checkedInBy: req.session.user.username
      });

      room.available = false;
      await room.save();
      await newBooking.save();
      savedBookings.push(await newBooking.populate("room")); // populate room for PDF
    }

    // === Generate PDF ===
    const invoiceName = "booking-" + savedBookings[0]._id + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

    const pdfDoc = new PDFDocument({ margin: 10 });
    pdfDoc.pipe(res);

    pdfDoc.fontSize(30).text("BoostA Biz Hotel Booking", { align: "center" });
    pdfDoc.moveDown();
    pdfDoc.fontSize(16).text("Customer Name: " + customerName);
    pdfDoc.text("Phone Number: " + phoneNumber);
    pdfDoc.text("Payment Method: " + payment);
    pdfDoc.moveDown();

    // Table header
    pdfDoc.fontSize(18).text("Room Bookings:");
    pdfDoc.moveDown();
    pdfDoc.fontSize(14);
    pdfDoc.text("Room", 50, pdfDoc.y, { continued: true });
    pdfDoc.text("Price/Night", 200, pdfDoc.y, { continued: true });
    pdfDoc.text("Total Price", 350, pdfDoc.y);
    pdfDoc.moveDown();

    // List all bookings
    savedBookings.forEach((b) => {
      pdfDoc.text(`${b.room.name}`, 50, pdfDoc.y, { continued: true });
      pdfDoc.text(`#${b.room.price.toFixed(2)}`, 200, pdfDoc.y, { continued: true });
      pdfDoc.text(`#${b.totalPrice.toFixed(2)}`, 350, pdfDoc.y);
      pdfDoc.moveDown();
    });

    const grandTotal = savedBookings.reduce((acc, b) => acc + b.totalPrice, 0);
    pdfDoc.moveDown();
    pdfDoc.fontSize(16).text("Grand Total: #" + grandTotal.toFixed(2));

    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text("Checked in by: " + req.session.user.username);
    pdfDoc.text("Date: " + new Date().toLocaleString());

    pdfDoc.end();

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).send("Server error creating booking");
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const role = req.session.user.role;
    let query = {};

    // Non-admin users see only their bookings
    if (role !== "admin") {
      query.customerPhone = req.session.user.phoneNumber;
    }

    const { room, customerName, paymentMethod, startDate, endDate } = req.query;

    // Fetch all bookings and populate room info
    let bookings = await Booking.find(query)
      .populate("room")
      .sort({ createdAt: -1 });

    // Apply additional filters on populated fields
    if (room) {
      bookings = bookings.filter(b => b.room.name === room);
    }
    if (customerName) {
      const nameRegex = new RegExp(customerName, "i");
      bookings = bookings.filter(b => nameRegex.test(b.customerName));
    }
    if (paymentMethod) {
      bookings = bookings.filter(b => b.paymentMethod === paymentMethod);
    }
    if (startDate) {
      bookings = bookings.filter(b => b.createdAt >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      bookings = bookings.filter(b => b.createdAt <= end);
    }

    const rooms = await HotelRoom.find().sort({ name: 1 });

    res.render("admin/bookings", {
      bookings,
      role,
      rooms,
      filters: { room, customerName, paymentMethod, startDate, endDate },
      errorMessage: req.flash("error"),
      successMessage: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.redirect("/");
  }
};

// Render booking form page
exports.getBookingForm = async (req, res, next) => {
  try {
    const role = req.session.user.role;

    // Fetch all available rooms
    const rooms = await HotelRoom.find({ available: true }).sort({ name: 1 });

    res.render("user/generateBooking", {
      rooms,
      role,
      errorMessage: req.flash("error"),
      successMessage: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    req.flash("error", "Failed to load booking form.");
    res.redirect("/");
  }
};

exports.checkoutBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate("room");
    if (!booking) return res.status(404).send("Booking not found");

    // Update booking
    booking.checkOut = new Date();
    booking.isActive = false;
    booking.paymentStatus = "paid";
    booking.checkedOutBy = req.session.user.username;

    await booking.save();

    // Mark room available again
    booking.room.available = true;
    await booking.room.save();

    res.redirect("/activeBookings");
  } catch (err) {
    console.log(err);
    res.status(500).send("Checkout error");
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const activeBookings = await Booking.find({ isActive: true })
      .populate("room");

    res.render("user/activeBookings", { 
      activeBookings,
      role: req.session.user.role 
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error loading active bookings");
  }
};

