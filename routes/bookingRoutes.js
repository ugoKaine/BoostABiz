const express = require("express");
const { check } = require("express-validator");
const bookingController = require("../controllers/bookingController");
const isAuth = require("../middleware/is_Auth");

const router = express.Router();

// POST new booking
router.post(
  "/booking",
  [
    check("roomId").notEmpty().withMessage("Room is required"),
    check("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1 day"),
    check("customerName").notEmpty(),
    check("customerPhone").notEmpty(),
    check("paymentMethod").notEmpty(),
  ],
  isAuth,
  bookingController.postBooking
);

// GET all bookings
router.get("/bookings", isAuth, bookingController.getBookings);

// GET booking form
router.get("/booking", isAuth, bookingController.getBookingForm);


module.exports = router;
