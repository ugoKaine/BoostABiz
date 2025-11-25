const Booking = require("../models/Booking");
const HotelRoom = require("../models/HotelRoom");

exports.postBooking = async (req, res, next) => {
  try {
    const { roomId, duration, customerName, customerPhone, customerAddress, paymentMethod, quantity } = req.body;

    if (!roomId || !duration || !customerName || !customerPhone || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await HotelRoom.findById(roomId);
    if (!room) return res.status(400).json({ message: "Room not found" });
    if (!room.available) return res.status(400).json({ message: "Room not available" });

    const totalPrice = room.price * duration * (quantity || 1);

    const newBooking = new Booking({
      room: room._id,
      customerName,
      customerPhone,
      customerAddress: customerAddress || "",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // auto-calculate
      totalPrice,
      paymentMethod,
      quantity: quantity || 1,
      paymentStatus: "pending",
      isActive: true,
    });

    await newBooking.save();

    res.status(200).json({ message: "Booking successful", booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error creating booking" });
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