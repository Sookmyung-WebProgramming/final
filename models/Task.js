const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  type: { type: String, enum: ["friend","team","meeting","study"], default: "friend" },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
