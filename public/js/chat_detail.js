document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("✅ DOMContentLoaded");

    // ===== 로그인 정보 =====
    const meRes = await fetch("/api/me", { credentials: "include" });
    if (!meRes.ok) throw new Error(`HTTP error! status: ${meRes.status}`);
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    const userId = meData.userId;
    document.getElementById("userId").textContent = meData.name;

    // ===== roomId 가져오기 =====
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    if (!roomId) throw new Error("roomId가 URL에 없음");

    const messagesContainer = document.querySelector(".chat-messages");

    // ===== 기존 메시지 =====
    const res = await fetch(`/api/chatrooms/${encodeURIComponent(roomId)}/messages`, { credentials: "include" });
    const data = await res.json();
    if (!data.success) throw new Error("메시지 불러오기 실패");
    data.messages.forEach(addMessageToDOM);

    // ===== Socket.IO 연결 =====
    const socket = io();
    socket.emit("joinRoom", roomId);

    // ===== 실시간 메시지 수신 =====
    socket.on("chatMessage", (msg) => addMessageToDOM(msg));

    // ===== 메시지 전송 =====
    const sendBtn = document.querySelector(".send-btn");
    const input = document.querySelector(".chat-input input[type='text']");
    sendBtn.addEventListener("click", () => {
      const content = input.value.trim();
      if (!content) return;
      socket.emit("chatMessage", { roomId, sender: userId, content });
      input.value = "";
    });

    // ===== 메시지 DOM 추가 =====
    function addMessageToDOM(msg) {
      const div = document.createElement("div");
      const isMe = msg.sender.userId === userId;
      div.className = isMe ? "message me" : "message friend";
      div.innerHTML = `
        <img src="${isMe ? 'images/9_profile.jpg' : 'images/9_카톡 기본프로필 사진.jpg'}" class="chat-img">
        <div class="chat-content">
          <div class="chat-name">${isMe ? "나" : msg.sender.name}</div>
          <div class="bubble-row">
            <div class="bubble">${msg.content}</div>
            <div class="meta">
              <span class="time">${new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>
      `;
      messagesContainer.appendChild(div);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

  } catch (err) {
    console.error("❌ 채팅 불러오기 실패:", err);
    const messagesContainer = document.querySelector(".chat-messages");
    if (messagesContainer) messagesContainer.innerHTML = `<div>메시지를 불러올 수 없습니다.</div>`;
  }
});