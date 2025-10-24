const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/chatRoom"); 
const userService = require("../services/userService");

let io;
function setSocket(ioInstance) {
  io = ioInstance;
}

// 새 채팅방 생성
router.post("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name) return res.json({ success: false, message: "채팅방 이름 필요" });
    if (!members || members.length === 0) return res.json({ success: false, message: "친구 선택 필요" });

    const roomMembers = [req.user.userId, ...members];
    const newRoom = new ChatRoom({ name, members: roomMembers });
    await newRoom.save();

    // Socket.IO: 모든 멤버에게 새 채팅방 알림
    if (io) {
      roomMembers.forEach(userId => {
        io.to(userId).emit("newChatRoom", {
          _id: newRoom._id,
          name: newRoom.name,
          lastSender: "",
          lastMessage: "",
          unreadCount: 0,
          favorite: false,
          profileImg: null,
          updatedAt: newRoom.updatedAt
        });
      });
    }

    res.json({ success: true, roomId: newRoom._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = { router, setSocket };
