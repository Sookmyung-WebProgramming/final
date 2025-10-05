const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  userId: String,
  name: String,
});

const chatRoomSchema = new mongoose.Schema({
  name: String,
  participants: [participantSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);