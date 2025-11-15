document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 로그인한 사용자 정보 가져오기
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    const user = meData.user;

    // 상단 네비게이션 프로필
    document.getElementById("userId").textContent = user?.name || "익명";
    const navProfileImg = document.querySelector(".nav-right .profile-img");
    if (navProfileImg) navProfileImg.src = user?.profileImg || "images/9_profile.jpg";

    // 좌측 박스 프로필
    const profileNameEl = document.querySelector(".profile-name");
    const profileStatusEl = document.querySelector(".profile-status");
    const profileImgEl = document.querySelector(".profile-img-wrap img");

    if (profileNameEl) profileNameEl.textContent = user?.name || "익명";
    if (profileStatusEl) profileStatusEl.textContent = user?.profileMessage || "";
    if (profileImgEl) profileImgEl.src = user?.profileImg || "images/9_people.png";

    // 오늘의 일정
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const checklistRes = await fetch(`/api/checklist/${year}/${month}`, { credentials: "include" });
    const checklistData = await checklistRes.json();

    const todayList = checklistData.items.filter(item => {
      const created = new Date(item.createdAt);
      return created.getDate() === date;
    });

    const todoListEl = document.querySelector(".todo-list");
    todoListEl.innerHTML = "";

    // 오늘 일정 표시 
    const titleEl = document.createElement("h3");
    titleEl.textContent = `${year}년 ${month}월 ${date}일`;
    todoListEl.appendChild(titleEl);

    if (todayList.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "오늘 일정이 없습니다.";
      todoListEl.appendChild(empty);
    } else {
      todayList.forEach(task => {
        const div = document.createElement("div");
        div.classList.add("task-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.checked;

        //할 일 체크시 체크리스트 연동 
        checkbox.addEventListener("change", async () => {
          try {
            await fetch(`/api/checklist/item/${task._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ checked: checkbox.checked }),
            });
          } catch (err) {
            console.error(err);
            checkbox.checked = !checkbox.checked;
          }
        });

        const label = document.createElement("label");
        label.textContent = task.content;

        const roomBtn = document.createElement("button");
        roomBtn.textContent = task.roomName || "룸 이름 없음";
        roomBtn.className = "room-btn";
        roomBtn.addEventListener("click", () => {
          const url = `/9_마라탕공주들_chat_detail.html?roomId=${task.roomId}&time=${encodeURIComponent(task.createdAt)}`;
          window.location.href = url;
        });

        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(roomBtn);
        todoListEl.appendChild(div);
      });
    }

    // 안읽은 채팅
    const chatRes = await fetch("/api/chatrooms", { credentials: "include" });
    const chatData = await chatRes.json();

    const unreadRooms = chatData.chatRooms.filter(r => r.unreadCount > 0);

    // 각 방의 멤버 숫자 조회
    const roomsWithMembers = await Promise.all(
      unreadRooms.map(async (room) => {
        try {
          const res = await fetch(`/api/chatrooms/${encodeURIComponent(room._id)}`, {
            credentials: "include",
          });
          const data = await res.json();

          const memberCount = data?.room?.members?.length ?? 1;
          return { ...room, memberCount };
        } catch (e) {
          console.warn("멤버 수 불러오기 실패:", room.name, e);
          return { ...room, memberCount: 1 };
        }
      })
    );

    const totalUnread = roomsWithMembers.reduce((sum, r) => sum + r.unreadCount, 0);
    document.querySelector(".title-num").textContent = totalUnread;

    const unreadListEl = document.querySelector(".unread-chat-list");
    unreadListEl.innerHTML = "";

    if (roomsWithMembers.length === 0) {
      unreadListEl.innerHTML = `<li><span class="todo-empty">읽지 않은 채팅이 없습니다.</span></li>`;
    } else {
      roomsWithMembers.forEach(room => {
        const totalMembers = room.memberCount || 1;

        let iconHTML = "";
        if (totalMembers >= 3) {
          iconHTML = `
            <div class="chat-img-group">
              <div class="chat-member-square"></div>
              <div class="chat-member-square"></div>
              <div class="chat-member-square"></div>
              <div class="chat-member-square"></div>
            </div>
          `;
        } else {
          iconHTML = `<div class="chat-img"></div>`;
        }

        unreadListEl.innerHTML += `
          <li>
            <a href="9_마라탕공주들_chat_detail.html?roomId=${room._id}">
              ${iconHTML}
              <div class="chat-text">
                <span class="chat-name">${room.name}</span>
                <span class="chat-preview">${room.lastMessage || ""}</span>
              </div>
              <div class="chat-time">
                <span class="time">${new Date(room.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span class="unread-count">${room.unreadCount}</span>
              </div>
            </a>
          </li>
        `;
      });
    }

  } catch (err) {
    console.error("홈 로딩 중 오류:", err);
  }
});

// ----------------------------------------------------------
// 슬라이더 부분
// ----------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".hero-card");
  const dots = document.querySelectorAll(".hero-dot");
  if (!cards.length) return;

  let current = 0;
  const total = cards.length;
  let timer = null;

  function showSlide(index) {
    cards[current].classList.remove("active");
    dots[current].classList.remove("active");

    current = index;

    cards[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function nextSlide() {
    const next = (current + 1) % total;
    showSlide(next);
  }

  timer = setInterval(nextSlide, 4000);

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.index);
      clearInterval(timer);
      showSlide(index);
      timer = setInterval(nextSlide, 4000);
    });
  });
});
