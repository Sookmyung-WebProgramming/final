const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/chatRoom"); // mongoose 모델
const userService = require("../services/userService");

// 채팅 목록 API
router.get("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    // 로그인된 사용자가 속한 채팅방 가져오기
    const rooms = await ChatRoom.find({ members: req.user.userId })
      .sort({ updatedAt: -1 })
      .lean();
    
    const chatRooms = rooms.map(r => ({
      _id: r._id,
      name: r.name,
      lastSender: r.lastMessage?.sender || "",
      lastMessage: r.lastMessage?.text || "",
      unreadCount: r.unreadCount || 0,
      favorite: r.favorite || false,
      profileImg: r.profileImg || null,
      updatedAt: r.updatedAt
    }));

    res.json({ success: true, chatRooms });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
