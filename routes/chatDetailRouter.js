const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Checklist = require("../models/Checklist");
const userService = require("../services/userService");

// 특정 채팅방 메시지 가져오기 API
router.get("/api/chatrooms/:roomId/messages", userService.authenticate, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userIdStr = req.user?.userId; 

    if (!roomId || !userIdStr) {
      return res.status(400).json({ success: false, message: "roomId 또는 userId 누락" });
    }

    // 문자열 userId -> ObjectId 변환 위해 User 조회
    const user = await User.findOne({ userId: userIdStr });
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없음" });
    }

    // 메시지 불러오기
    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name userId")
      .lean();

    res.json({ success: true, messages});
  } catch (err) {
    console.error("❌ 메시지 불러오기 오류:", err);
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