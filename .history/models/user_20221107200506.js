const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  active: { type: Number, default: 1 },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
