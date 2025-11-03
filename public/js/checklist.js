document.addEventListener("DOMContentLoaded", async () => {
  const tasksContainer = document.getElementById("tasks-container");
  const calendarContainer = document.getElementById("calendar-dates");
  const calendarHeader = document.getElementById("calendar-header");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const userIdEl = document.getElementById("userId");

  let currentYear, currentMonth;

  try {
    // 로그인 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    userIdEl.textContent = meData.name;

    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;

    renderCalendar(currentYear, currentMonth);
  } catch (err) {
    console.error("checklist.js 오류 :", err);
  }

  // 달력 렌더링
  async function renderCalendar(year, month) {
    calendarContainer.innerHTML = "";
    tasksContainer.innerHTML = "<h3>날짜를 선택하세요</h3>";
    calendarHeader.textContent = `${year}년 ${month}월`;

    try {
      const res = await fetch(`/api/checklist/${year}/${month}`, { credentials: "include" });
      const data = await res.json();
      const items = data.items || [];

      const tasksByDate = {};
      items.forEach(item => {
        const createdAt = new Date(item.createdAt);
        const d = createdAt.getDate();
        const key = `${year}-${month}-${d}`;
        if (!tasksByDate[key]) tasksByDate[key] = [];
        tasksByDate[key].push(item);
      });

      const daysInMonth = new Date(year, month, 0).getDate();
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${month}-${day}`;
        const hasContent = tasksByDate[key];
        const button = document.createElement("button");
        button.textContent = `${day}일`;
        button.classList.add("day");

        if (key === todayKey) button.classList.add("today"); // 오늘 날짜 강조
        if (hasContent) button.classList.add("has-content");

        calendarContainer.appendChild(button);

        button.addEventListener("click", () => {
          // 선택 표시
          document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
          button.classList.add("selected");

          // 할 일 렌더링
          tasksContainer.innerHTML = `<h3>${month}월 ${day}일 할 일</h3>`;
          const dayTasks = tasksByDate[key] || [];
          if (dayTasks.length === 0) {
            tasksContainer.innerHTML += "<p>할 일이 없습니다.</p>";
            return;
          }

          dayTasks.forEach(task => {
            const div = document.createElement("div");
            div.classList.add("task-item");

            // 체크박스
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.checked;

            // 내용 라벨
            const label = document.createElement("label");
            label.textContent = task.content;

            // 생성 시간 표시 (한국 시간)
            const timeSpan = document.createElement("span");
            const date = new Date(task.createdAt);
            timeSpan.textContent = `(${date.getHours()}시 ${date.getMinutes()}분)`;

            // 룸 이름 버튼
            const roomBtn = document.createElement("button");
            roomBtn.textContent = task.roomName || "룸 이름 없음"; // 백엔드에서 roomName 제공
            roomBtn.className = "room-btn";
            roomBtn.addEventListener("click", () => {
              // 채팅방 페이지 이동 + 특정 시간 스크롤
              const url = `/9_마라탕공주들_chat_detail.html?roomId=${task.roomId}&time=${encodeURIComponent(task.createdAt)}`;
              window.open(url, "_blank"); // 새 탭에서 열기
            });

            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(timeSpan);
            div.appendChild(roomBtn);

            tasksContainer.appendChild(div);
          });
        });
      }

    } catch (err) {
      console.error("달력 렌더링 중 오류 : ", err);
    }
  }

  // 이전/다음 달 버튼
  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
});