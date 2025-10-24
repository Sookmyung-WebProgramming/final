const socket = io();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 로그인 사용자 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    document.getElementById("userId").textContent = meData.name;

    // Socket.IO 개인방 join
    socket.emit("registerUser", meData.userId);

    // 채팅 목록 초기 로드
    const res = await fetch("/api/chatrooms", { credentials: "include" });
    const data = await res.json();
    renderChatRooms(data.chatRooms);

  } catch (err) {
    console.error(err);
  }
});

// 실시간 새 채팅방 수신
socket.on("newChatRoom", (room) => {
  prependChatRoom(room);
});

// ===================== 채팅방 렌더 함수 =====================
function renderChatRooms(rooms) {
  const chatList = document.getElementById("chatList");
  const chatProfiles = document.getElementById("chatProfiles");
  chatList.innerHTML = "";
  chatProfiles.innerHTML = "";

  rooms.forEach(prependChatRoom);
}

function prependChatRoom(room) {
  const chatList = document.getElementById("chatList");
  const chatProfiles = document.getElementById("chatProfiles");

  const profileLi = document.createElement("li");
  profileLi.innerHTML = `<img class="mini-profile" src="${room.profileImg || 'images/9_person_50dp_FFFFFF.svg'}" alt="">`;
  chatProfiles.prepend(profileLi);

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
  chatList.prepend(li);
}

// ===================== 친구 선택 모달 =====================
const createRoomBtn = document.getElementById("createRoomBtn");
const friendModal = document.getElementById("friendModal");
const closeModal = document.querySelector(".close");
const friendListEl = document.getElementById("friendList");
const createChatRoomConfirm = document.getElementById("createChatRoomConfirm");
let selectedFriends = [];

// 모달 열기
createRoomBtn.addEventListener("click", async () => {
  friendModal.style.display = "block";
  friendListEl.innerHTML = "";
  selectedFriends = [];

  try {
    const res = await fetch("/api/users/friends", { credentials: "include" });
    const data = await res.json();
    data.friends.forEach(user => {
      const li = document.createElement("li");
      li.innerHTML = `<label><input type="checkbox" value="${user.userId}"> ${user.name}</label>`;
      li.querySelector("input").addEventListener("change", () => {
        li.classList.toggle("selected", li.querySelector("input").checked);
      });
      friendListEl.appendChild(li);
    });
  } catch (err) {
    friendListEl.innerHTML = `<li>친구 목록을 불러올 수 없습니다.</li>`;
  }
});

// 모달 닫기
closeModal.addEventListener("click", () => closeFriendModal());
window.addEventListener("click", (e) => { if (e.target === friendModal) closeFriendModal(); });

function closeFriendModal() {
  friendModal.style.display = "none";
  document.getElementById("chatRoomName").value = "";
  friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
  selectedFriends = [];
}

// 채팅방 생성
createChatRoomConfirm.addEventListener("click", async () => {
  const chatRoomName = document.getElementById("chatRoomName").value.trim();
  selectedFriends = Array.from(friendListEl.querySelectorAll("input[type='checkbox']:checked")).map(i => i.value);

  if (!chatRoomName) return alert("채팅방 이름을 입력하세요.");
  if (selectedFriends.length === 0) return alert("친구를 최소 1명 선택하세요.");

  try {
    const res = await fetch("/api/chatrooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: chatRoomName, members: selectedFriends })
    });
    const data = await res.json();
    if (data.success) closeFriendModal();
    else alert("채팅방 생성 실패");
  } catch (err) {
    console.error(err);
  }
});
