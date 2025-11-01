document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 로그인 사용자 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    if (!meRes.ok) throw new Error(`HTTP error! status: ${meRes.status}`);
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");
    document.getElementById("userId").textContent = meData.name;

    // 서버에서 채팅 목록 가져오기
    const res = await fetch("/api/chatrooms", { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("채팅 목록 불러오기 실패");

    const chatList = document.getElementById("chatList");
    const chatProfiles = document.getElementById("chatProfiles");
    chatList.innerHTML = "";
    chatProfiles.innerHTML = "";

    data.chatRooms.forEach(room => {
      // 프로필 이미지
      const profileLi = document.createElement("li");
      profileLi.innerHTML = `<img class="mini-profile" src="${room.profileImg || 'images/9_person_50dp_FFFFFF.svg'}" alt="">`;
      chatProfiles.appendChild(profileLi);

      // 채팅 내용
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="9_마라탕공주들_chat_detail.html?roomId=${encodeURIComponent(room._id)}">
          <div class="chat-info">
            <span class="chat-name">${room.name}</span><br>
            <span class="chat-preview">${room.lastSender || ''}: ${room.lastMessage || ''}</span>
          </div>
          <span class="subBox">
            ${room.unreadCount ? `<span class="unread-count">${room.unreadCount}</span>` : ''}
            <img class="icon ${room.favorite ? "" : "not"}" src="images/9_star_50dp_8050F2.svg" alt="">
            <span class="time">${room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </span>
        </a>
      `;
      chatList.appendChild(li);
    });

  } catch (err) {
    console.error("채팅 목록 불러오기 실패:", err);
    const chatList = document.getElementById("chatList");
    const chatProfiles = document.getElementById("chatProfiles");
    chatList.innerHTML = `<li>채팅 목록을 불러올 수 없습니다.</li>`;
    chatProfiles.innerHTML = `<li></li>`;
  }
});

// ===================== 친구 선택 모달 =====================
const createRoomBtn = document.getElementById("createRoomBtn");
const friendModal = document.getElementById("friendModal");
const closeModal = document.querySelector(".close");
const friendListEl = document.getElementById("friendList");
const createChatRoomConfirm = document.getElementById("createChatRoomConfirm");

let selectedFriends = [];

// 채팅방 만들기 버튼 클릭
createRoomBtn.addEventListener("click", async () => {
  friendModal.style.display = "block";
  friendListEl.innerHTML = "";
  selectedFriends = [];

  try {
    const res = await fetch("/api/users/friends", { credentials: "include" });
    const data = await res.json();
    if (!data.success) throw new Error("친구 목록 불러오기 실패");

    // 에러 처리
    const friends = Array.isArray(data.friends) ? data.friends : [];
    if (friends.length === 0) {
      friendListEl.innerHTML = `<li>친구 목록이 없습니다.</li>`;
      return;
    }

    data.friends.forEach(user => {
      const li = document.createElement("li");
      li.classList.add("friend-item");

      // 체크박스 포함
      li.innerHTML = `
        <label>
          <input type="checkbox" value="${user.userId}">
          ${user.name}
        </label>
      `;

      // 체크박스 클릭 시 선택 표시
      const checkbox = li.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          li.classList.add("selected");
        } else {
          li.classList.remove("selected");
        }
      });

      friendListEl.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    friendListEl.innerHTML = `<li>친구 목록을 불러올 수 없습니다.</li>`;
  }
});

// 모달 닫기
closeModal.addEventListener("click", () => {
  friendModal.style.display = "none";
  document.getElementById("chatRoomName").value = ""; // 채팅방 이름 초기화
  friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
  selectedFriends = [];
});

// 채팅방 생성
createChatRoomConfirm.addEventListener("click", async () => {
  const chatRoomName = document.getElementById("chatRoomName").value.trim();
  selectedFriends = Array.from(friendListEl.querySelectorAll("input[type='checkbox']:checked"))
                         .map(input => input.value);

  if (!chatRoomName) return alert("채팅방 이름을 입력하세요.");
  if (selectedFriends.length === 0) return alert("친구를 최소 1명 선택하세요.");

  try {
    const res = await fetch("/api/chatrooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: chatRoomName,     // 채팅방 이름 포함
        members: selectedFriends
      })
    });
    const data = await res.json();
    if (data.success) {
      alert("채팅방 생성 완료!");
      friendModal.style.display = "none";
      document.getElementById("chatRoomName").value = ""; // 초기화
      friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
      selectedFriends = [];
      location.reload();
    } else {
      alert("채팅방 생성 실패");
    }
  } catch (err) {
    console.error(err);
  }
});

// 모달 외부 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (e.target === friendModal) {
    friendModal.style.display = "none";
    document.getElementById("chatRoomName").value = "";
    friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
    selectedFriends = [];
  }
});