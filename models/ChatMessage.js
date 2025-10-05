const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  senderName: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);