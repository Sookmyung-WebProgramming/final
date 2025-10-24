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