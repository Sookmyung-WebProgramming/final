document.addEventListener("DOMContentLoaded", async () => {
  const tasksContainer = document.getElementById("tasks-container");
  const noticesContainer = document.getElementById("notices-container");
  const calendarContainer = document.getElementById("calendar-dates");

  try {
    // 로그인 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    document.getElementById("userId").textContent = meData.name;

    // 체크리스트 요청
    const year = 2025;
    const month = 10;
    const res = await fetch(`/api/checklist/${year}/${month}`, { credentials: "include" });
    const data = await res.json();
    const items = data.items || [];

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

    // 달력 렌더링
    for (let day = 1; day <= 31; day++) {
      const hasContent = tasksByDate[day] || noticesByDate[day];
      const button = document.createElement("button");
      button.textContent = `${day}일`;
      button.classList.add("day");
      if (hasContent) button.classList.add("has-content");
      calendarContainer.appendChild(button);

      // 버튼 클릭 시 할 일/공지 렌더링
      button.addEventListener("click", () => {
        
        // tasksContainer 초기화
        tasksContainer.innerHTML = "<h3>할 일</h3>";
        const dayTasks = tasksByDate[day] || [];
        dayTasks.forEach(task => {
          const div = document.createElement("div");
          div.classList.add("task-item");
          div.textContent = task.content;
          tasksContainer.appendChild(div);
        });

        // noticesContainer 초기화
        noticesContainer.innerHTML = "<h3>공지</h3>";
        const dayNotices = noticesByDate[day] || [];
        dayNotices.forEach(notice => {
          const div = document.createElement("div");
          div.classList.add("notice-item");
          div.textContent = notice.content;
          noticesContainer.appendChild(div);
        });
      });
    }

  } catch (err) {
    console.error("checklist.js 오류 발생:", err);
  }
});