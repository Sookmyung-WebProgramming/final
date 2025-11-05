document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".history-media-grid");
  const chatroomList = document.querySelector(".chatroom-list");
  const filterBox = document.querySelector(".filter-box");
  const filterCheckboxes = filterBox.querySelectorAll("input[type='checkbox']");
  const searchInput = document.querySelector(".search-media");
  const searchBtn = document.querySelector(".search-btn");

  // 로그인 확인
  try {
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    document.getElementById("userId").textContent = meData.name;
  } catch (err) {
    alert("로그인 후 이용 가능합니다.");
    return;
  }

  // ===== 보관함 데이터 불러오기 =====
  let allItems = [];
  try {
    const res = await fetch("/api/history", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.items) throw new Error("데이터 로드 실패");

    allItems = data.items;

    // 채팅방 목록 추출
    const rooms = [
      ...new Map(allItems.map(i => [i.chatRoomId, i.chatRoomName])).entries()
    ];

    // 왼쪽 채팅방 목록 생성
    chatroomList.innerHTML = `
      <li class="active" data-room="all"><a href="#">전체보기</a></li>
      ${rooms
        .map(([id, name]) => `<li data-room="${id}"><a href="#">${name}</a></li>`)
        .join("")}
    `;

    // 기본 표시 (전체, 모든 타입)
    applyFilters();

  } catch (err) {
    console.error("보관함 데이터 로드 실패:", err);
    grid.innerHTML = `<p style="color:red;">보관함 데이터를 불러오지 못했습니다.</p>`;
  }

  // ===== 채팅방 클릭 시 필터링 =====
  chatroomList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    chatroomList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    li.classList.add("active");

    applyFilters();
  });

  // ===== 체크박스 필터 적용 =====
  filterCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      applyFilters();
    });
  });

  // ===== 검색 버튼 클릭 또는 Enter =====
  searchBtn.addEventListener("click", applyFilters);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyFilters();
  });

  // ===== 클릭 시 채팅 시점으로 이동 =====
  grid.addEventListener("click", (e) => {
    const meta = e.target.closest(".media-meta");
    if (meta) {
      const roomId = meta.dataset.roomId;
      const createdAt = meta.dataset.createdAt;
      if (roomId && createdAt) {
        window.location.href = `/9_마라탕공주들_chat_detail.html?roomId=${encodeURIComponent(roomId)}&time=${encodeURIComponent(createdAt)}`;
      }
    }
  });

  // ===== 필터 + 검색 적용 함수 =====
  function applyFilters() {
    // 선택된 채팅방
    const activeRoomLi = chatroomList.querySelector("li.active");
    const selectedRoomId = activeRoomLi?.dataset.room || "all";

    // 선택된 타입
    const selectedTypes = Array.from(filterCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.nextSibling.textContent.trim().toLowerCase());

    // 검색어
    const keyword = searchInput.value.trim().toLowerCase();

    let filtered = allItems;

    if (selectedRoomId !== "all") {
      filtered = filtered.filter(i => i.chatRoomId === selectedRoomId);
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(i => {
        if (i.type === "image" && selectedTypes.includes("사진")) return true;
        if (i.type === "video" && selectedTypes.includes("동영상")) return true;
        if (i.type === "file" && selectedTypes.includes("문서")) return true;
        if (i.type === "link" && selectedTypes.includes("링크")) return true;
        return false;
      });
    }

    if (keyword) {
      filtered = filtered.filter(i =>
        (i.senderName || "").toLowerCase().includes(keyword) ||
        (i.content || "").toLowerCase().includes(keyword) ||
        (i.chatRoomName || "").toLowerCase().includes(keyword)
      );
    }

    renderGrid(filtered);
  }

  // ===== 렌더 함수 =====
  function renderGrid(items) {
    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML = `<p style="color:gray;">해당 조건의 항목이 없습니다.</p>`;
      return;
    }

    items.forEach(item => {
      const date = new Date(item.createdAt);
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} • ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;

      let thumbHtml = "";
      if (item.type === "image") thumbHtml = `<img src="${item.content}" alt="이미지" />`;
      else if (item.type === "video") thumbHtml = `<video src="${item.content}" muted preload="metadata"></video>`;
      else thumbHtml = `<img src="../images/9_logo.svg" alt="파일/링크" />`;

      const html = `
        <div class="media-item">
          <a class="media-thumb" href="${item.content}" target="_blank" rel="noopener noreferrer">${thumbHtml}</a>
          <div class="media-meta"
               data-room-id="${item.chatRoomId}"
               data-message-id="${item.id}"
               data-created-at="${item.createdAt}">
            <p class="media-title">
              [${item.chatRoomName}] ${item.senderName || "알 수 없음"} : ${item.content}
            </p>
            <p class="media-date">${formatted}</p>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML("beforeend", html);
    });
  }

});