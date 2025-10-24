document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ===== 로그인 정보 =====
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    const userId = meData.userId;
    document.getElementById("userId").textContent = meData.name;

    // ===== roomId 가져오기 =====
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    if (!roomId) throw new Error("roomId가 URL에 없음");

    const messagesContainer = document.querySelector(".chat-messages");

    // ===== 기존 메시지 로드 =====
    const res = await fetch(`/api/chatrooms/${encodeURIComponent(roomId)}/messages`, { credentials: "include" });
    const data = await res.json();
    if (data.success) data.messages.forEach(addMessageToDOM);

    // ===== Socket.IO 연결 =====
    const socket = io();
    socket.emit("joinRoom", roomId);
    socket.on("chatMessage", (msg) => addMessageToDOM(msg));

    // ===== 텍스트 전송 =====
    const sendBtn = document.querySelector(".send-btn");
    const input = document.querySelector(".chat-input input[type='text']");

    function sendTextMessage() {
      const content = input.value.trim();
      if (!content) return;
      socket.emit("chatMessage", { roomId, sender: userId, content, type: "text" });
      input.value = "";
    }

    sendBtn.addEventListener("click", sendTextMessage);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendTextMessage(); });

    // ===== 파일 전송 =====
    const fileInput = document.getElementById("file-upload");
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      let content = file.name;
      let type;

      if (/\.jpg$|\.png$|\.jpeg$/i.test(file.name)) type = "image";
      else if (/\.mp4$|\.mov$|\.avi$/i.test(file.name)) type = "video";
      else if (/\.xlsx$|\.pdf$|\.docx$/i.test(file.name)) type = "file";
      else type = "text";

      // 테스트용 샘플 링크
      switch(type) {
        case "image": content = "https://news.samsungdisplay.com/wp-content/uploads/2018/08/8.jpg"; break;
        case "video": content = "https://youtu.be/YTgazB4a0uY?si=aVUdwWmPiPwnoZ9D"; break;
        case "file":  content = "http://javakorean.com/wp2/wp-content/uploads/2014/11/2014-HTML5-%EC%9D%B8%ED%84%B0%EB%84%B7%EB%B3%B4%EC%B6%A9%ED%95%99%EC%8A%B5%EC%9E%90%EB%A3%8C-01%EA%B0%95.pdf"; break;
      }

      socket.emit("chatMessage", { roomId, sender: userId, content, type });
      fileInput.value = "";
    });

    // ===== 메시지 DOM 추가 =====
    function addMessageToDOM(msg) {
      const div = document.createElement("div");
      const isMe = msg.sender.userId === userId;
      div.className = isMe ? "message me" : "message friend";

      let contentHTML = "";
      switch(msg.type) {
        case "image":
          contentHTML = `<img src="${msg.content}" alt="이미지" class="chat-media">`; break;
        case "video":
          contentHTML = `<a href="${msg.content}" target="_blank">동영상 보기 ▶</a>`; break;
        case "file":
          contentHTML = `<a href="${msg.content}" target="_blank">파일 다운로드 📄</a>`; break;
        case "link":
          contentHTML = `<a href="${msg.content}" target="_blank">${msg.content}</a>`; break;
        case "text":
          contentHTML = msg.content; break;
      }

      div.innerHTML = `
        <img src="${isMe ? 'images/9_profile.jpg' : 'images/9_카톡 기본프로필 사진.jpg'}" class="chat-img">
        <div class="chat-content">
          <div class="chat-name">${isMe ? "나" : msg.sender.name}</div>
          <div class="bubble-row">
            <div class="bubble">${contentHTML}</div>
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
    document.querySelector(".chat-messages").innerHTML = `<div>메시지를 불러올 수 없습니다.</div>`;
  }
});
