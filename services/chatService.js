const ChatMessage = require("../models/ChatMessage");

async function saveMessage(msg) {
  const message = new ChatMessage(msg);
  return await message.save();
}

async function getMessagesByRoomId(roomId) {
  return await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
}

module.exports = { saveMessage, getMessagesByRoomId };