const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const userService = require("../services/userService");

// 보관함용 메시지 조회 API
router.get("/api/history", userService.authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      type: { $in: ["image", "video", "file", "link"] }
    })
      .populate("sender", "name profileImage")
      .populate("chatRoom", "name")
      .sort({ createdAt: -1 });

    const result = messages.map(msg => ({
      id: msg._id,
      chatRoomId: msg.chatRoom?._id,
      chatRoomName: msg.chatRoom?.name || "알 수 없음", 
      senderName: msg.sender?.name || "익명",
      type: msg.type,
      content: msg.content,
      createdAt: msg.createdAt,
      profileImage: msg.sender?.profileImage,
    }));

    res.json({ success: true, items: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "보관함 데이터를 불러오지 못했습니다." });
  }
});

module.exports = router;