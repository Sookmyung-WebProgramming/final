const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const userService = require("../services/userService");

// 특정 채팅방 메시지 가져오기
router.get("/api/chatrooms/:roomId/messages", userService.authenticate, async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name userId")
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
