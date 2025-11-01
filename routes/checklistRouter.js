const express = require("express");
const router = express.Router();
const Checklist = require("../models/Checklist");
const userService = require("../services/userService");

const checklistService = {
  
  // 월별 체크리스트 조회 (UTC 기준)
  async getChecklistsByMonth(userId, year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Checklist.find({
      userId: String(userId),
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });
  },

  // 체크 상태 토글
  async toggleChecklist(id, userId) {
    const checklist = await Checklist.findOne({ _id: id, userId: String(userId) });
    if (!checklist) throw new Error("체크리스트를 찾을 수 없습니다.");

    checklist.checked = !checklist.checked;
    await checklist.save();
    return checklist;
  },

  // 체크리스트 삭제
  async deleteChecklist(id, userId) {
    const checklist = await Checklist.findOneAndDelete({ _id: id, userId: String(userId) });
    if (!checklist) throw new Error("체크리스트를 찾을 수 없습니다.");
    return checklist;
  },
};


// 월별 체크리스트 조회 API 
router.get("/api/checklist/:year/:month", userService.authenticate, async (req, res) => {
  try {
    const { year, month } = req.params;
    const items = await checklistService.getChecklistsByMonth(req.user.userId, year, month);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 체크 상태 토글 API 
router.patch("/api/checklist/:id/toggle", userService.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await checklistService.toggleChecklist(id, req.user.userId);
    res.json({ success: true, checklist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 체크리스트 삭제 API 
router.delete("/api/checklist/:id", userService.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await checklistService.deleteChecklist(id, req.user.userId);
    res.json({ success: true, checklist });
  } catch (err) {
    console.error("delete 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;