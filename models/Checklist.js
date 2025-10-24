const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  content: { type: String, required: true },
  checked: { type: Boolean, default: false },
  type: { type: String, enum: ["task", "notice"], default: "task" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Checklist", checklistSchema);