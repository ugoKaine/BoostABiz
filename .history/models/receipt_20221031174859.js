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

    username: String,
    lastname: String,
    firstname: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", userSchema);
