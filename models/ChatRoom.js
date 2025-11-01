const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const chatRoomSchema = new mongoose.Schema({
  name: String,
  members: [String],  // userId 배열
  lastMessage: messageSchema,
  unreadCount: { type: Number, default: 0 },
  favorite: { type: Boolean, default: false },
  profileImg: String,
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);