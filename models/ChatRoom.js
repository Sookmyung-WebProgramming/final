const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  name: String,
  members: [String],  // userId 배열
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: Date
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);