const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true }, 
  name: { type: String, required: true },
  profileImg: { type: String },
  profileMessage: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("User", userSchema); 