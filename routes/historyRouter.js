const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// 보관함용 메시지 조회 API
router.get("/api/history", async (req, res) => {
  try {
    // 보관함은 텍스트 제외
    const messages = await Message.find({
      type: { $in: ["image", "video", "file", "link"] }
    })
      .populate("sender", "name profileImage")  // 보낸 사람 이름, 프로필
      .populate("chatRoom", "title")            // 채팅방 이름
      .sort({ createdAt: -1 });                 // 최신순

    // 응답 구조 가공
    const result = messages.map(msg => ({
      id: msg._id,
      chatRoomId: msg.chatRoom?._id,
      chatRoomName: msg.chatRoom?.title || "알 수 없음",
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