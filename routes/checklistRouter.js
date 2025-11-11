const express = require("express");
const router = express.Router();
const Checklist = require("../models/Checklist");
const ChatRoom = require("../models/chatRoom"); 
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

  // roomName 채우기
  const roomIds = [...new Set(items.map(item => item.roomId.toString()))]; // 문자열 변환

  const rooms = await ChatRoom.find({ _id: { $in: roomIds } }).select("name");

  const roomMap = {};
  rooms.forEach(r => {
    roomMap[r._id.toString()] = r.name; 
  });

  const itemsWithRoomName = items.map(item => ({
    ...item.toObject(),
    roomName: roomMap[item.roomId.toString()] || "룸 없음" 
  }));

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

// 체크리스트 체크 상태 업데이트 API
router.patch(
  "/api/checklist/item/:id",
  userService.authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { checked } = req.body;

      const checklist = await Checklist.findById(id);
      if (!checklist) {
        return res.status(404).json({ success: false, message: "체크리스트를 찾을 수 없습니다." });
      }

      // 본인의 체크리스트만 수정 가능
      if (checklist.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "권한이 없습니다." });
      }

      checklist.checked = checked === true;
      await checklist.save();

      res.json({ success: true, checklist });
    } catch (err) {
      console.error("체크리스트 업데이트 오류:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;