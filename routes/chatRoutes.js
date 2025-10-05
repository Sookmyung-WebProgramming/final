const express = require("express");
const router = express.Router();
const service = require("../services/chatService");

router.get("/:roomId", async (req, res) => {
  try {
    const result = await service.getMessagesByRoomId(req.params.roomId);
    res.json({ isSuccess: true, result });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

module.exports = router;