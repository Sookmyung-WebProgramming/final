const Checklist = require("../models/Checklist");

const checklistService = {
  // 월별 체크리스트 조회 (UTC 기준)
  async getChecklistsByMonth(userId, year, month) {
    console.log("🔹 모든 체크리스트 (limit 10) 확인:", await Checklist.find({}).limit(10));

    // ✅ UTC 기준 start / end
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end   = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    console.log("🔹 getChecklistsByMonth 호출");
    console.log("🔹 조회 조건:", { userId, start, end });

    const items = await Checklist.find({
      userId: String(userId),
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: 1 });

    console.log("🔹 조회 결과 items:", items);
    return items;
  },

  // 체크 상태 토글
  async toggleChecklist(id, userId) {
    console.log("🔹 toggleChecklist 호출:", { id, userId });
    const checklist = await Checklist.findOne({ _id: id, userId: String(userId) });
    if (!checklist) throw new Error("체크리스트를 찾을 수 없습니다.");
    checklist.checked = !checklist.checked;
    await checklist.save();
    console.log("🔹 toggleChecklist 저장 완료:", checklist);
    return checklist;
  },

  // 체크리스트 삭제
  async deleteChecklist(id, userId) {
    console.log("🔹 deleteChecklist 호출:", { id, userId });
    const checklist = await Checklist.findOneAndDelete({ _id: id, userId: String(userId) });
    if (!checklist) throw new Error("체크리스트를 찾을 수 없습니다.");
    console.log("🔹 deleteChecklist 완료:", checklist);
    return checklist;
  },
};

module.exports = checklistService;
