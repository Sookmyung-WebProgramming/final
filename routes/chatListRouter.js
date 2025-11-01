const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/chatRoom"); 
const User = require("../models/User");
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

// 새 채팅방 생성 API
router.post("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    const { name, members } = req.body; 
    if (!members || members.length === 0) 
      return res.json({ success: false, message: "친구 선택 필요" });
    if (!name || name.trim() === "") 
      return res.json({ success: false, message: "채팅방 이름 필요" });

    // 로그인 사용자도 멤버에 포함
    const roomMembers = [req.user.userId, ...members];

    const newRoom = new ChatRoom({ name, members: roomMembers });
    await newRoom.save();

    res.json({ success: true, roomId: newRoom._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// 사용자 친구 목록 가져오기 API 
router.get("/api/users/friends", userService.authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).populate("friends", "name userId");
    if (!user) return res.json({ success: false, message: "사용자 없음" });

    res.json({ success: true, friends: user.friends });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "친구 목록 불러오기 실패" });
  }
});

module.exports = router;