const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");

async function createChatRoom({ name, hostId, userIds }) {
  const users = await User.find({ userId: { $in: [...userIds, hostId] } });
  const participants = users.map(u => ({ userId: u.userId, name: u.name }));
  const room = new ChatRoom({ name, participants });
  return await room.save();
}

async function getChatRoomsByUserId(userId) {
  return await ChatRoom.find({ "participants.userId": userId });
}

async function getChatRoomDetails(chatRoomId) {
  const room = await ChatRoom.findById(chatRoomId);
  if (!room) throw new Error("채팅방 없음");
  return room;
}

module.exports = { createChatRoom, getChatRoomsByUserId, getChatRoomDetails };