const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  type: { type: String, enum: ["friend","team","meeting","study"], default: "friend" }
});

module.exports = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
