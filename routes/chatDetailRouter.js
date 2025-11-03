const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Checklist = require("../models/Checklist");
const userService = require("../services/userService");

// 특정 채팅방 메시지 가져오기 API 
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

// 할 일 등록 API 
router.post("/api/checklist", async (req, res) => {
  try {
    const { userId, roomId, messageId, content, createdAt } = req.body;

    if (!userId || !roomId || !content) {
      console.warn("필수 데이터 누락", req.body);
      return res.status(400).json({ success: false, error: "필수 데이터 누락" });
    }

    const checklist = await Checklist.create({
      userId,
      roomId: new mongoose.Types.ObjectId(roomId),          
      messageId: messageId ? new mongoose.Types.ObjectId(messageId) : undefined, 
      content,
      createdAt: createdAt ? new Date(createdAt) : Date.now() // 메시지 시간 그대로
    });

    console.log("✅ 체크리스트 생성 완료", checklist);
    res.json({ success: true, checklist });
  } catch(err) {
    console.error("체크리스트 생성 실패 : ", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;