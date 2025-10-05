const express = require("express");
const router = express.Router();
const service = require("../services/chatRoomService");

router.post("/create", async (req, res) => {
  try {
    const result = await service.createChatRoom(req.body);
    res.json({ isSuccess: true, result });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

router.get("/list/:userId", async (req, res) => {
  try {
    const result = await service.getChatRoomsByUserId(req.params.userId);
    res.json({ isSuccess: true, result: { chatRooms: result } });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

router.get("/details/:chatRoomId", async (req, res) => {
  try {
    const result = await service.getChatRoomDetails(req.params.chatRoomId);
    res.json({ isSuccess: true, result });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

module.exports = router;