const mongoose = require("mongoose");

const hotelRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    price: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      default: 2, // optional but useful
    },

    description: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HotelRoom", hotelRoomSchema);
