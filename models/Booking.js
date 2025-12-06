const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelRoom",
      required: true,
    },

    // Customer info
    customerName: {
      type: String,
      trim: true,
      required: true,
    },

    customerPhone: {
      type: String,
      trim: true,
      required: true,
    },

    customerAddress: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: false,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },

    // Booking status
    isActive: {
      type: Boolean,
      default: true,
    },
   checkedInBy: {
      type: String,
      required: true
    },

    checkedOutBy: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
