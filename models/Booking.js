const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelRoom",
      required: true,
    },

    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "checked-in", "checked-out", "cancelled"],
      default: "booked",
    },

    checkedInBy: String,
    checkedOutBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);