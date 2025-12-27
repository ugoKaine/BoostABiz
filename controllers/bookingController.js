const path = require("path");
const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");
const HotelRoom = require("../models/HotelRoom");
const User = require("../models/user");

const calculateDays = (start, end) => Math.ceil((end - start) / (1000 * 60 * 60 * 24));
const normalizeCheckIn = (date) => { date.setHours(12,0,0,0); return date; };
const normalizeCheckOut = (date) => { date.setHours(12,0,0,0); return date; };

exports.postBooking = async (req, res) => {
  try {
    let { bookings, customerName, phoneNumber, payment } = req.body;

    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).send("No bookings submitted");
    }

    if (!customerName || !phoneNumber || !payment) {
      return res.status(400).send("Missing customer info or payment");
    }

    const savedBookings = [];

    for (const b of bookings) {
  const { room: roomName } = b;
  const { checkIn, checkOut } = req.body;

  if (!roomName || !checkIn || !checkOut) {
    return res.status(400).send("Missing room or dates");
  }

  const room = await HotelRoom.findOne({ name: roomName });
  if (!room) {
    return res.status(404).send(`Room ${roomName} not found`);
  }

  const normalizedCheckIn = normalizeCheckIn(new Date(checkIn));
  const normalizedCheckOut = normalizeCheckOut(new Date(checkOut));

  if (normalizedCheckOut <= normalizedCheckIn) {
    return res.status(400).send("Check-out must be after check-in");
  }

  // 🔴 Availability check
  const conflict = await Booking.findOne({
    room: room._id,
    status: { $in: ["booked", "checked-in"] },
    checkIn: { $lt: normalizedCheckOut },
    checkOut: { $gt: normalizedCheckIn }
  });

  if (conflict) {
    return res
      .status(400)
      .send(`Room ${roomName} is not available for selected dates`);
  }

  const nights = calculateDays(normalizedCheckIn, normalizedCheckOut);
  const totalPrice = nights * room.price;

  const booking = new Booking({
    room: room._id,
    customerName,
    customerPhone: phoneNumber,
    checkIn: normalizedCheckIn,
    checkOut: normalizedCheckOut,
    totalPrice,
    paymentMethod: payment,
    status: "booked",
    checkedInBy: req.session.user.username
  });

  await booking.save();
  savedBookings.push(await booking.populate("room"));
}


    // Generate PDF (like before)
    const pdfDoc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="booking.pdf"`);
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("BoostA Biz Hotel Booking", { align: "center" }).moveDown(1);
    pdfDoc.fontSize(14);
    pdfDoc.text(`Customer Name: ${customerName}`);
    pdfDoc.text(`Phone Number: ${phoneNumber}`);
    pdfDoc.text(`Payment Method: ${payment}`);
    pdfDoc.moveDown(1.5);

    const tableTop = pdfDoc.y;
    const colRoom = 50, colPrice = 260, colTotal = 400;
    pdfDoc.fontSize(15).text("Room", colRoom, tableTop);
    pdfDoc.text("Price/Night", colPrice, tableTop);
    pdfDoc.text("Total Price", colTotal, tableTop);
    pdfDoc.moveTo(colRoom, tableTop + 18).lineTo(550, tableTop + 18).stroke();

    let y = tableTop + 22;
    pdfDoc.fontSize(13);
    savedBookings.forEach(b => {
      pdfDoc.text(b.room.name, colRoom, y);
      pdfDoc.text(`#${b.room.price.toFixed(2)}`, colPrice, y);
      pdfDoc.text(`#${b.totalPrice.toFixed(2)}`, colTotal, y);
      y += 22;
    });

    const grandTotal = savedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    pdfDoc.moveTo(colRoom, y + 5).lineTo(550, y + 5).stroke();
    y += 15;
    pdfDoc.fontSize(15).text("Grand Total:", colPrice, y).text(`#${grandTotal.toFixed(2)}`, colTotal, y);

    pdfDoc.moveDown(2);
    pdfDoc.fontSize(12).text(`Checked in by: ${req.session.user.username}`);
    pdfDoc.text(`Date: ${new Date().toLocaleString()}`);
    pdfDoc.end();

  } catch (err) {
    console.error(err);
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

    const { room, checkedInBy, paymentMethod, startDate, endDate } = req.query;

    // Fetch all bookings and populate room info
    let bookings = await Booking.find(query)
      .populate("room")
      .sort({ createdAt: -1 });

    // Apply additional filters on populated fields
    if (room) {
      bookings = bookings.filter(b => b.room.name === room);
    }
 if (checkedInBy) {
  const userRegex = new RegExp(checkedInBy, "i");
  bookings = bookings.filter(b => userRegex.test(b.checkedInBy));
}

    if (paymentMethod) {
      bookings = bookings.filter(b => b.paymentMethod === paymentMethod);
    }
    if (startDate || endDate) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  bookings = bookings.filter(b => {
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);

    return (
      (!start || checkOut >= start) &&
      (!end || checkIn <= end)
    );
  });
}
    const rooms = await HotelRoom.find().sort({ name: 1 });
    const users = await User.find({}, "username").sort({ username: 1 });


    res.render("admin/bookings", {
      bookings,
      role,
      rooms,
        u: users.map(user => user.username), 
      filters: { room, checkedInBy, paymentMethod, startDate, endDate },
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking not found");

    booking.status = "checked-out";
    booking.checkedOutBy = req.session.user.username;

    await booking.save();

    res.redirect("/activeBookings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Checkout failed");
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const activeBookings = await Booking.find({
      status: { $in: ["booked", "checked-in"] }
    }).populate("room");

    res.render("user/activeBookings", {
      activeBookings,
      role: req.session.user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading active bookings");
  }
};

exports.getAvailableRooms = async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) return res.json([]);

  const normalizedCheckIn = new Date(checkIn);
  normalizedCheckIn.setHours(12,0,0,0);
  const normalizedCheckOut = new Date(checkOut);
  normalizedCheckOut.setHours(12,0,0,0);

  const bookedRooms = await Booking.find({
    status: { $in: ["booked", "checked-in"] },
    checkIn: { $lt: normalizedCheckOut },
    checkOut: { $gt: normalizedCheckIn }
  }).distinct("room");

  const availableRooms = await HotelRoom.find({ _id: { $nin: bookedRooms } });
  res.json(availableRooms);
};

