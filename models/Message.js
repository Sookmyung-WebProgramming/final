const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["text", "image", "video", "link", "file"], 
    default: "text" 
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);