const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/chatRoom");
const userService = require("../services/userService");

// 새 채팅방 생성
router.post("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    const { name, members } = req.body; // name 추가
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


module.exports = router;
