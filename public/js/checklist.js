document.addEventListener("DOMContentLoaded", async () => {
  // DOM 요소 가져오기
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarHeader = document.getElementById("calendar-header");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const filterOptions = document.getElementById("filter-options");
  const taskList = document.getElementById("task-list");
  const noticeList = document.getElementById("notice-list");
  const selectedDate = document.getElementById("selected-date");
  const selectedDateNotice = document.getElementById("selected-date-notice");
  const userIdEl = document.getElementById("userId");
  const roomDropdown = document.getElementById("room-dropdown");
  const roomSelectToggle = document.getElementById("room-select-toggle");
  const roomSelectLabel = document.getElementById("room-select-label");
  const roomSelectMenu = document.getElementById("room-select-menu");

  // 현재 날짜 정보
  let currentYear, currentMonth;
  let selectedDay = null; // 선택된 날짜
  let allItems = []; // 모든 체크리스트 아이템
  let selectedRooms = new Set(); // 선택된 채팅방 필터
  let chatRoomNames = []; // 드롭다운에 표시할 채팅방 이름 목록

  // 초기화
  try {
    // 로그인 정보 가져오기
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    // 이름 표시
    const userName = meData.user?.name || meData.name || "사용자";
    userIdEl.textContent = userName;

    // 상단 프로필 이미지 표시
    const navProfileImg = document.querySelector(".nav-right .profile-img");
    if (navProfileImg) navProfileImg.src = meData.user?.profileImg || "images/9_profile.jpg";

    // 오늘 날짜로 초기화
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    selectedDay = today.getDate();

    // 전체 필터 기본 선택
    selectedRooms.add("all");

    // 채팅방 목록 로드 및 드롭다운 구성
    await loadRooms();

    // 달력 렌더링
    await loadCalendar();
  } catch (err) {
    console.error("초기화 오류:", err);
  }

  // 채팅방 목록 불러오기 및 드롭다운 채우기
  async function loadRooms() {
    try {
      const res = await fetch("/api/chatrooms", { credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error("채팅방 목록 로드 실패");
      chatRoomNames = (data.chatRooms || []).map(r => r.name).filter(Boolean);

      // 커스텀 드롭다운 구성
      if (roomSelectMenu && roomSelectLabel && roomDropdown && roomSelectToggle) {
        // 메뉴 초기화 및 '전체' 추가
        roomSelectMenu.innerHTML = "";
        const makeItem = (value, text) => {
          const li = document.createElement("li");
          li.className = "dropdown-item";
          li.dataset.value = value;
          li.textContent = text;
          if ((selectedRooms.has("all") && value === "all") || selectedRooms.has(text)) {
            li.classList.add("selected");
          }
          li.addEventListener("click", () => {
            // 선택 갱신
            selectedRooms.clear();
            selectedRooms.add(value);
            // 라벨 갱신
            roomSelectLabel.textContent = text;
            // 항목 선택 표시 갱신
            roomSelectMenu.querySelectorAll(".dropdown-item").forEach(el => el.classList.remove("selected"));
            li.classList.add("selected");
            // 렌더링
            renderCalendar();
            renderTasksAndNotices();
            // 닫기
            roomDropdown.classList.remove("open");
            roomSelectMenu.setAttribute("aria-hidden", "true");
          });
          return li;
        };
        roomSelectMenu.appendChild(makeItem("all", "전체"));
        chatRoomNames.forEach(name => roomSelectMenu.appendChild(makeItem(name, name)));

        // 라벨 초기화
        roomSelectLabel.textContent = selectedRooms.has("all") ? "전체" : [...selectedRooms][0] || "전체";

        // 토글 동작
        roomSelectToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = roomDropdown.classList.toggle("open");
          roomSelectMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        });

        // 바깥 클릭 시 닫기
        document.addEventListener("click", (e) => {
          if (!roomDropdown.contains(e.target)) {
            roomDropdown.classList.remove("open");
            roomSelectMenu.setAttribute("aria-hidden", "true");
          }
        });
      }
    } catch (err) {
      console.error("채팅방 목록 로드 오류:", err);
    }
  }

  // 달력 데이터 로드 및 렌더링
  async function loadCalendar() {
    try {
      // API에서 데이터 가져오기
      const res = await fetch(`/api/checklist/${currentYear}/${currentMonth}`, {
        credentials: "include"
      });
      const data = await res.json();
      allItems = data.items || [];

      // 필터 옵션 업데이트 (드롭다운 선택 상태만 동기화)
      updateFilterOptions();

      // 달력 렌더링
      renderCalendar();

      // 할 일 및 공지 표시
      renderTasksAndNotices();
    } catch (err) {
      console.error("달력 로드 오류:", err);
    }
  }

  // 필터 옵션 업데이트
  function updateFilterOptions() {
    // 커스텀 드롭다운 라벨만 선택 상태에 맞춰 동기화
    if (roomSelectLabel) {
      roomSelectLabel.textContent = selectedRooms.has("all") ? "전체" : [...selectedRooms][0] || "전체";
    }
    if (roomSelectMenu) {
      roomSelectMenu.querySelectorAll(".dropdown-item").forEach(item => {
        const isSelected = selectedRooms.has("all") ? item.dataset.value === "all" : item.dataset.value === [...selectedRooms][0];
        item.classList.toggle("selected", !!isSelected);
      });
    }
  }

  // 달력 렌더링
  function renderCalendar() {
    // 헤더 업데이트
    calendarHeader.textContent = `${currentYear}년 ${currentMonth}월`;

    // 필터링된 아이템
    const filteredItems = selectedRooms.has("all")
      ? allItems
      : allItems.filter(item => selectedRooms.has(item.roomName));

    // 날짜별 할 일 개수 계산
    const tasksByDate = {};
    filteredItems.forEach(item => {
      const date = new Date(item.createdAt);
      const day = date.getDate();
      if (!tasksByDate[day]) tasksByDate[day] = [];
      tasksByDate[day].push(item);
    });

    // 달력 그리드 초기화 (요일 이름 제외)
    const dayNames = calendarGrid.querySelectorAll(".day-name");
    calendarGrid.innerHTML = "";
    dayNames.forEach(dayName => calendarGrid.appendChild(dayName));

    // 첫 번째 날의 요일 구하기
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

    // 이전 달의 마지막 날들
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = document.createElement("div");
      day.className = "day prev-month";
      day.textContent = prevMonthDays - i;
      calendarGrid.appendChild(day);
    }

    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      dayEl.className = "day";
      dayEl.textContent = day;

      // 오늘 날짜 표시
      if (isCurrentMonth && day === today.getDate()) {
        dayEl.classList.add("today");
      }

      // 선택된 날짜 표시
      if (day === selectedDay) {
        dayEl.classList.add("selected");
      }

      // 할 일이 있는 날 표시
      if (tasksByDate[day] && tasksByDate[day].length > 0) {
        dayEl.classList.add("has-tasks");
      }

      // 날짜 클릭 이벤트
      dayEl.addEventListener("click", () => {
        selectedDay = day;
        renderCalendar();
        renderTasksAndNotices();
      });

      calendarGrid.appendChild(dayEl);
    }

    // 다음 달의 첫 날들 (달력 완성)
    const totalCells = calendarGrid.children.length - 7; // 요일 이름 제외
    const remainingCells = 42 - totalCells; // 6주 * 7일 = 42
    if (remainingCells > 0) {
      for (let day = 1; day <= remainingCells; day++) {
        const dayEl = document.createElement("div");
        dayEl.className = "day next-month";
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
      }
    }
  }

  // 할 일 및 공지 렌더링
  function renderTasksAndNotices() {
    if (!selectedDay) return;

    // 필터링된 아이템
    const filteredItems = selectedRooms.has("all")
      ? allItems
      : allItems.filter(item => selectedRooms.has(item.roomName));

    // 선택된 날짜의 할 일 필터링
    const selectedDateStr = new Date(currentYear, currentMonth - 1, selectedDay);
    const dayTasks = filteredItems.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getFullYear() === selectedDateStr.getFullYear() &&
             itemDate.getMonth() === selectedDateStr.getMonth() &&
             itemDate.getDate() === selectedDateStr.getDate();
    });

    // 날짜 표시
    const dateStr = `${currentYear}년 ${currentMonth}월 ${selectedDay}일`;
    selectedDate.textContent = dateStr;
    selectedDateNotice.textContent = dateStr;

    // 할 일 목록 렌더링
    taskList.innerHTML = "";
    if (dayTasks.length === 0) {
      taskList.innerHTML = "<li style='padding: 20px; text-align: center; color: #999;'>할 일이 없습니다.</li>";
    } else {
      dayTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.setAttribute("data-chat", task.roomName);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${index}`;
        checkbox.checked = task.checked || false;
        
        // 체크박스 변경 이벤트
        checkbox.addEventListener("change", async () => {
          if (!task._id) {
            console.error("체크리스트 ID가 없습니다:", task);
            checkbox.checked = !checkbox.checked;
            return;
          }

          try {
            const res = await fetch(`/api/checklist/item/${task._id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ checked: checkbox.checked }),
            });

            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
              // 로컬 데이터 업데이트
              const item = allItems.find(item => item._id === task._id || item._id?.toString() === task._id?.toString());
              if (item) {
                item.checked = checkbox.checked;
              }
            } else {
              // 실패 시 체크박스 상태 되돌리기
              checkbox.checked = !checkbox.checked;
              alert("체크 상태 저장에 실패했습니다: " + (data.message || "알 수 없는 오류"));
            }
          } catch (err) {
            console.error("체크 상태 저장 오류:", err);
            checkbox.checked = !checkbox.checked;
            alert("체크 상태 저장에 실패했습니다.");
          }
        });

        const label = document.createElement("label");
        label.htmlFor = `task-${index}`;
        label.textContent = task.content;
        label.style.fontSize = "16px";

        const badge = document.createElement("a");
        badge.href = '9_마라탕공주들_chat_detail.html?roomId=' + encodeURIComponent(task.roomId) + '&time=' + encodeURIComponent(task.createdAt);
        badge.className = "chat-badge";
        badge.textContent = task.roomName || "룸 이름 없음";

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(badge);
        taskList.appendChild(li);
      });
    }

    // 공지 목록 렌더링 (현재는 비어있음 - 나중에 확장 가능)
    noticeList.innerHTML = "";
    noticeList.innerHTML = "<li style='padding: 20px; text-align: center; color: #999;'>공지가 없습니다.</li>";
  }

  // 이전 달 버튼
  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    selectedDay = 1; // 새 달에서는 첫 날 선택
    loadCalendar();
  });

  // 다음 달 버튼
  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    selectedDay = 1; // 새 달에서는 첫 날 선택
    loadCalendar();
  });
});
