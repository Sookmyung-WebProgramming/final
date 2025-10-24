document.addEventListener("DOMContentLoaded", async () => {
  const tasksContainer = document.getElementById("tasks-container");
  const noticesContainer = document.getElementById("notices-container");
  const calendarContainer = document.getElementById("calendar-dates");

  try {
    console.log("📌 checklist.js 시작");

    // 로그인 정보
    console.log("🔹 로그인 정보 요청 중...");
    const meRes = await fetch("/api/me", { credentials: "include" });
    console.log("🔹 /api/me 응답 상태:", meRes.status);
    const meData = await meRes.json();
    console.log("🔹 /api/me 응답 데이터:", meData);
    if (!meData.success) throw new Error("로그인 정보 없음");
    document.getElementById("userId").textContent = meData.name;
    console.log("🔹 사용자 이름 DOM에 반영 완료:", meData.name);

    // 체크리스트 요청
    const year = 2025;
    const month = 10;
    console.log(`🔹 체크리스트 요청: ${year}-${month}`);
    const res = await fetch(`/api/checklist/${year}/${month}`, { credentials: "include" });
    console.log("🔹 /api/checklist 응답 상태:", res.status);
    const data = await res.json();
    console.log("🔹 /api/checklist 응답 데이터:", data);
    const items = data.items || [];
    console.log("🔹 items 배열:", items);

    const tasksByDate = {};
    const noticesByDate = {};
    items.forEach(item => {
      const day = new Date(item.createdAt).getDate();
      console.log(`- item: ${item.content}, type: ${item.type}, day: ${day}`);
      if (item.type === "task") {
        if (!tasksByDate[day]) tasksByDate[day] = [];
        tasksByDate[day].push(item);
      } else if (item.type === "notice") {
        if (!noticesByDate[day]) noticesByDate[day] = [];
        noticesByDate[day].push(item);
      }
    });
    console.log("🔹 tasksByDate:", tasksByDate);
    console.log("🔹 noticesByDate:", noticesByDate);

    // 달력 렌더링
    for (let day = 1; day <= 31; day++) {
      const hasContent = tasksByDate[day] || noticesByDate[day];
      const button = document.createElement("button");
      button.textContent = `${day}일`;
      button.classList.add("day");
      if (hasContent) button.classList.add("has-content");
      calendarContainer.appendChild(button);
      console.log(`🔹 ${day}일 버튼 생성`, button);

      // 버튼 클릭 시 할 일/공지 렌더링
      button.addEventListener("click", () => {
        console.log(`🔹 ${day}일 선택됨`);
        
        // tasksContainer 초기화
        tasksContainer.innerHTML = "<h3>할 일</h3>";
        console.log("🔹 tasksContainer 초기화");
        const dayTasks = tasksByDate[day] || [];
        dayTasks.forEach(task => {
          const div = document.createElement("div");
          div.classList.add("task-item");
          div.textContent = task.content;
          tasksContainer.appendChild(div);
          console.log("   - task 추가:", task.content, div);
        });

        // noticesContainer 초기화
        noticesContainer.innerHTML = "<h3>공지</h3>";
        console.log("🔹 noticesContainer 초기화");
        const dayNotices = noticesByDate[day] || [];
        dayNotices.forEach(notice => {
          const div = document.createElement("div");
          div.classList.add("notice-item");
          div.textContent = notice.content;
          noticesContainer.appendChild(div);
          console.log("   - notice 추가:", notice.content, div);
        });
      });
    }

    console.log("✅ checklist.js 실행 완료");
  } catch (err) {
    console.error("❌ checklist.js 오류 발생:", err);
  }
});
