const mongoose = require("mongoose");

const chatRoomUserStatusSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastReadAt: { type: Date, default: null }
});

module.exports = mongoose.models.ChatRoomUserStatus || mongoose.model("ChatRoomUserStatus", chatRoomUserStatusSchema);