const mongoose = require("mongoose");

const hotelRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    available: {
      type: Boolean,
      default: true, // Room starts as available
    }

    // // Optional: link to a shop
    // shop: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Shop",
    //   required: true, // If each shop has its own set of rooms
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HotelRoom", hotelRoomSchema);
