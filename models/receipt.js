const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const receiptSchema = new Schema(
  {
    receiptField: {
      type: [],
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },

    username: String,
    lastname: String,
    firstname: String,

    // Customer info (now optional)
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
