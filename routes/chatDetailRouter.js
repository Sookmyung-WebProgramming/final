const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const userService = require("../services/userService");

// 특정 채팅방 메시지 가져오기
router.get("/api/chatrooms/:roomId/messages", userService.authenticate, async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Message 컬렉션에서 roomId와 일치하는 메시지 조회
    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: 1 }) // 시간 순 정렬
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
