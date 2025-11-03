const express = require("express");
const router = express.Router();
const Checklist = require("../models/Checklist");
const ChatRoom = require("../models/ChatRoom");
const userService = require("../services/userService");

// 월별 체크리스트 조회 (UTC 기준)
async function getChecklistsByMonth(userId, year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // 체크리스트 가져오기
  const items = await Checklist.find({
    userId: String(userId),
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: 1 });

  console.log("체크리스트 조회 : ", items);

  // roomName 채우기
  const roomIds = [...new Set(items.map(item => item.roomId.toString()))]; // 문자열 변환
  console.log("roomIds : ", roomIds);

  const rooms = await ChatRoom.find({ _id: { $in: roomIds } }).select("name");
  console.log("rooms 조회 : ", rooms);

  const roomMap = {};
  rooms.forEach(r => {
    roomMap[r._id.toString()] = r.name; 
  });
  console.log("roomMap : ", roomMap);

  const itemsWithRoomName = items.map(item => ({
    ...item.toObject(),
    roomName: roomMap[item.roomId.toString()] || "룸 없음" 
  }));

  console.log("itemsWithRoomName : ", itemsWithRoomName);

  return itemsWithRoomName;
}

// 월별 체크리스트 조회 API
router.get(
  "/api/checklist/:year/:month",
  userService.authenticate,
  async (req, res) => {
    try {
      const { year, month } = req.params;
      const items = await getChecklistsByMonth(req.user.userId, year, month);
      res.json({ success: true, items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;