document.addEventListener("DOMContentLoaded", async () => {
  const tasksContainer = document.getElementById("tasks-container");
  const calendarContainer = document.getElementById("calendar-dates");
  const calendarHeader = document.getElementById("calendar-header");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const userIdEl = document.getElementById("userId");
  const roomFilter = document.getElementById("room-filter");

  let currentYear, currentMonth;
  let allItems = [];
  let selectedDateKey = null; // 현재 선택된 날짜 기억 

  try {
    // 로그인 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    userIdEl.textContent = meData.name;

    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    selectedDateKey = `${currentYear}-${currentMonth}-${today.getDate()}`; // 기본 : 오늘 선택

    await renderCalendar(currentYear, currentMonth);
  } catch (err) {
    console.error("checklist.js 오류 :", err);
  }

  // ===== 달력 렌더링 =====
  async function renderCalendar(year, month) {
    calendarContainer.innerHTML = "";
    tasksContainer.innerHTML = "<h3>날짜를 선택하세요</h3>";
    calendarHeader.textContent = `${year}년 ${month}월`;

    try {
      const res = await fetch(`/api/checklist/${year}/${month}`, { credentials: "include" });
      const data = await res.json();
      allItems = data.items || [];

      updateRoomFilter();
      updateCalendar();
    } catch (err) {
      console.error("달력 렌더링 중 오류 : ", err);
    }
  }

  // ===== 달력 UI 갱신 (필터 반영 + 선택 유지) =====
  function updateCalendar() {
    calendarContainer.innerHTML = "";

    const selectedRoom = roomFilter.value || "all";
    const filteredItems = selectedRoom === "all"
      ? allItems
      : allItems.filter(item => item.roomName === selectedRoom);

    // 날짜별 task 분류
    const tasksByDate = {};
    filteredItems.forEach(item => {
      const createdAt = new Date(item.createdAt);
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth() + 1;
      const day = createdAt.getDate();
      const key = `${year}-${month}-${day}`;
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(item);
    });

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 오늘이 속한 달이 아닐 경우 선택 초기화
    if (!selectedDateKey.startsWith(`${currentYear}-${currentMonth}-`)) {
      selectedDateKey = todayKey;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${currentYear}-${currentMonth}-${day}`;
      const hasContent = tasksByDate[key];
      const button = document.createElement("button");
      button.textContent = `${day}일`;
      button.classList.add("day");

      if (key === todayKey) button.classList.add("today");
      if (hasContent) button.classList.add("has-content");
      if (key === selectedDateKey) button.classList.add("selected");

      calendarContainer.appendChild(button);

      // 날짜 클릭 시 선택 변경
      button.addEventListener("click", () => {
        selectedDateKey = key; // 선택 날짜 갱신
        updateCalendar(); // 전체 달력 다시 그림 (선택 상태 유지)
      });
    }

    // 선택된 날짜의 할 일 표시
    renderTasksForDate(selectedDateKey, tasksByDate);
  }

  // ===== 선택된 날짜의 할 일 표시 =====
  function renderTasksForDate(key, tasksByDate) {
    const [year, month, day] = key.split("-");
    tasksContainer.innerHTML = `<h3>${month}월 ${day}일 할 일</h3>`;

    const dayTasks = tasksByDate[key] || [];
    if (dayTasks.length === 0) {
      tasksContainer.innerHTML += "<p>할 일이 없습니다.</p>";
      return;
    }

    dayTasks.forEach(task => {
      const div = document.createElement("div");
      div.classList.add("task-item");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.checked;

      const label = document.createElement("label");
      label.textContent = task.content;

      const timeSpan = document.createElement("span");
      const date = new Date(task.createdAt);
      timeSpan.textContent = `(${date.getHours()}시 ${date.getMinutes()}분)`;

      const roomBtn = document.createElement("button");
      roomBtn.textContent = task.roomName || "룸 이름 없음";
      roomBtn.className = "room-btn";
      roomBtn.addEventListener("click", () => {
        const url = `/9_마라탕공주들_chat_detail.html?roomId=${task.roomId}&time=${encodeURIComponent(task.createdAt)}`;
        window.location.href = url;
      });

      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(timeSpan);
      div.appendChild(roomBtn);
      tasksContainer.appendChild(div);
    });
  }

  // ===== 필터 select 갱신 =====
  function updateRoomFilter() {
    const roomNames = [...new Set(allItems.map(item => item.roomName).filter(Boolean))];
    const currentValue = roomFilter.value;
    roomFilter.innerHTML = `<option value="all">전체 보기</option>`;
    roomNames.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      roomFilter.appendChild(opt);
    });
    roomFilter.value = currentValue || "all";
  }

  // ===== 필터 변경 시 달력 갱신 =====
  roomFilter.addEventListener("change", () => {
    updateCalendar();
  });

  // ===== 이전/다음 달 이동 =====
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