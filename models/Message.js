const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 읽은 사용자
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);