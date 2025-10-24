const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 읽은 사용자
  createdAt: { type: Date, default: Date.now }
});

// ✅ 모델이 이미 있으면 재사용, 없으면 새로 생성
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);