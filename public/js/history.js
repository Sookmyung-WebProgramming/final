document.addEventListener("DOMContentLoaded", async () => {
  // DOM 요소
  const grid = document.querySelector(".history-media-grid");
  const chatroomList = document.querySelector(".chatroom-list");
  const filterBox = document.querySelector(".filter-box");
  const searchInput = document.querySelector(".search-media");
  const userIdEl = document.getElementById("userId");
  const roomDropdown = document.getElementById("history-room-dropdown");
  const roomToggle = document.getElementById("history-room-toggle");
  const roomLabel = document.getElementById("history-room-label");
  const roomMenu = document.getElementById("history-room-menu");

  // 상태 관리
  let allItems = [];
  let selectedRoomId = "all";
  let selectedTypes = ["사진", "동영상"];
  let chatRooms = [];

  // 타입 매핑
  const typeMap = {
    image: "사진",
    video: "동영상",
    file: "문서",
    link: "링크"
  };

  // 초기화
  try {
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    
    userIdEl.textContent = meData.name;
    await loadRooms();
    await loadHistory();
  } catch (err) {
    console.error("초기화 오류:", err);
    alert("로그인 후 이용 가능합니다.");
  }

  // 채팅방 목록 로드 및 드롭다운 구성
  async function loadRooms() {
    try {
      const res = await fetch("/api/chatrooms", { credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error("채팅방 목록 로드 실패");
      chatRooms = data.chatRooms || [];

      if (roomMenu && roomLabel && roomDropdown && roomToggle) {
        roomMenu.innerHTML = "";
        const addItem = (value, text) => {
          const li = document.createElement("li");
          li.className = "dropdown-item";
          li.dataset.value = value;
          li.textContent = text;
          if ((selectedRoomId === "all" && value === "all") || selectedRoomId === value) {
            li.classList.add("selected");
          }
          li.addEventListener("click", () => {
            selectedRoomId = value;
            roomLabel.textContent = text;
            roomMenu.querySelectorAll(".dropdown-item").forEach(el => el.classList.remove("selected"));
            li.classList.add("selected");
            renderGrid();
            roomDropdown.classList.remove("open");
            roomMenu.setAttribute("aria-hidden", "true");
          });
          return li;
        };

        roomMenu.appendChild(addItem("all", "전체"));
        chatRooms.forEach(r => {
          if (r && r._id && r.name) {
            roomMenu.appendChild(addItem(String(r._id), r.name));
          }
        });

        roomLabel.textContent = "전체";

        roomToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = roomDropdown.classList.toggle("open");
          roomMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        });

        document.addEventListener("click", (e) => {
          if (!roomDropdown.contains(e.target)) {
            roomDropdown.classList.remove("open");
            roomMenu.setAttribute("aria-hidden", "true");
          }
        });
      }
    } catch (err) {
      console.error("채팅방 목록 로드 오류:", err);
    }
  }

  // 데이터 로드
  async function loadHistory() {
    try {
      const res = await fetch("/api/history", { credentials: "include" });
      const data = await res.json();
      
      if (!data.success || !data.items) throw new Error("데이터 로드 실패");

      allItems = data.items;
      // 드롭다운은 /api/chatrooms 기준으로 구성됨. 좌측 리스트는 숨김.
      setupFilters();
      renderGrid();
    } catch (err) {
      console.error("보관함 데이터 로드 실패:", err);
      showError("보관함 데이터를 불러오지 못했습니다.");
    }
  }

  // 채팅방 목록 업데이트
  function updateChatroomList() {
    const roomMap = new Map();
    allItems.forEach(item => {
      if (item.chatRoomId && item.chatRoomName) {
        roomMap.set(item.chatRoomId.toString(), item.chatRoomName);
      }
    });

    chatroomList.innerHTML = `
      <li class="active" data-room="all"><a href="#">전체</a></li>
      ${Array.from(roomMap.entries())
        .map(([id, name]) => `<li data-room="${id}"><a href="#">${name}</a></li>`)
        .join("")}
    `;

    chatroomList.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        chatroomList.querySelectorAll("li").forEach(l => l.classList.remove("active"));
        li.classList.add("active");
        selectedRoomId = li.dataset.room || "all";
        renderGrid();
      });
    });
  }

  // 필터 설정
  function setupFilters() {
    const checkboxes = filterBox.querySelectorAll("input[type='checkbox']");
    
    checkboxes.forEach(checkbox => {
      const label = checkbox.nextSibling.textContent.trim();
      if (label === "사진" || label === "동영상") {
        checkbox.checked = true;
      }

      checkbox.addEventListener("change", () => {
        selectedTypes = Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.nextSibling.textContent.trim());
        renderGrid();
      });
    });
  }

  // 검색 (실시간)
  searchInput.addEventListener("input", renderGrid);

  // 필터링 및 렌더링
  function renderGrid() {
    let filtered = allItems;

    // 채팅방 필터
    if (selectedRoomId !== "all") {
      filtered = filtered.filter(item => 
        item.chatRoomId?.toString() === selectedRoomId
      );
    }

    // 타입 필터
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => 
        selectedTypes.includes(typeMap[item.type])
      );
    }

    // 검색어 필터
    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(item =>
        (item.senderName || "").toLowerCase().includes(keyword) ||
        (item.content || "").toLowerCase().includes(keyword) ||
        (item.chatRoomName || "").toLowerCase().includes(keyword)
      );
    }

    // 렌더링
    grid.innerHTML = "";
    
    if (filtered.length === 0) {
      grid.innerHTML = getEmptyStateHTML();
    } else {
      filtered.forEach(item => {
        grid.appendChild(createMediaItem(item));
      });
    }
  }

  // 빈 상태 HTML
  function getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p class="empty-state-message">해당 조건의 항목이 없습니다.</p>
        <p class="empty-state-submessage">다른 검색어나 필터를 시도해보세요.</p>
      </div>
    `;
  }

  // 미디어 아이템 생성
  function createMediaItem(item) {
    const div = document.createElement("div");
    div.className = "media-item";
    div.dataset.roomId = item.chatRoomId;
    div.dataset.createdAt = item.createdAt;

    // 썸네일
    const thumbDiv = document.createElement("div");
    thumbDiv.className = "media-thumb";
    thumbDiv.style.cursor = "pointer";
    thumbDiv.addEventListener("click", () => window.open(item.content, "_blank"));
    
    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.content;
      img.alt = "이미지";
      img.onerror = () => { img.src = "images/9_logo.svg"; };
      thumbDiv.appendChild(img);
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.content;
      video.muted = true;
      video.preload = "metadata";
      thumbDiv.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = "images/9_logo.svg";
      img.alt = "파일/링크";
      thumbDiv.appendChild(img);
    }

    // 메타 정보
    const metaDiv = document.createElement("div");
    metaDiv.className = "media-meta";
    metaDiv.style.cursor = "pointer";
    
    const titleP = document.createElement("p");
    titleP.className = "media-title";
    titleP.textContent = `[${item.chatRoomName || "알 수 없음"}] ${item.senderName || "익명"}`;
    
    const dateP = document.createElement("p");
    dateP.className = "media-date";
    dateP.textContent = formatDate(item.createdAt);
    
    metaDiv.appendChild(titleP);
    metaDiv.appendChild(dateP);
    metaDiv.addEventListener("click", () => {
      if (item.chatRoomId && item.createdAt) {
        window.location.href = `/9_마라탕공주들_chat_detail.html?roomId=${item.chatRoomId}&time=${encodeURIComponent(item.createdAt)}`;
      }
    });

    div.appendChild(thumbDiv);
    div.appendChild(metaDiv);
    
    return div;
  }

  // 날짜 포맷팅
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day} • ${hours}:${minutes}`;
  }

  // 에러 표시
  function showError(message) {
    grid.innerHTML = `<p style="color:red; padding: 20px;">${message}</p>`;
  }
});
