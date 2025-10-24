const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const checklistService = require("../services/checklistService");

// 연도/월별 체크리스트 조회
router.get("/api/checklist/:year/:month", userService.authenticate, async (req, res) => {
  try {
    console.log("🔹 /api/checklist 요청 들어옴");
    console.log("🔹 req.user:", req.user); // 로그인 유저 정보 확인
    const { year, month } = req.params;
    console.log(`🔹 요청 파라미터 - year: ${year}, month: ${month}`);

    const items = await checklistService.getChecklistsByMonth(req.user.userId, year, month);
    console.log("🔹 checklistService.getChecklistsByMonth 결과:", items);

    res.json({ success: true, items });
  } catch (err) {
    console.error("❌ /api/checklist 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 체크 상태 토글
router.patch("/api/checklist/:id/toggle", userService.authenticate, async (req, res) => {
  try {
    console.log("🔹 toggle 요청:", req.params.id);
    const { id } = req.params;
    const userId = req.user.userId;
    const checklist = await checklistService.toggleChecklist(id, userId);
    console.log("🔹 toggle 결과:", checklist);
    res.json({ success: true, checklist });
  } catch (err) {
    console.error("❌ toggle 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 체크리스트 삭제
router.delete("/api/checklist/:id", userService.authenticate, async (req, res) => {
  try {
    console.log("🔹 delete 요청:", req.params.id);
    const { id } = req.params;
    const userId = req.user.userId;
    const checklist = await checklistService.deleteChecklist(id, userId);
    console.log("🔹 delete 결과:", checklist);
    res.json({ success: true, checklist });
  } catch (err) {
    console.error("❌ delete 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
