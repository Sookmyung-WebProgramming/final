document.addEventListener("DOMContentLoaded", async () => {
  try {
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    const userId = meData.userId;
    const userName = meData.user?.name || meData.name;

    // 상단 이름 업데이트
    document.getElementById("userId").textContent = userName;

    // 상단 프로필 이미지 업데이트
    const navProfileImg = document.querySelector(".nav-right .profile-img");
    if (navProfileImg) navProfileImg.src = meData.user?.profileImg || "images/9_profile.jpg";
    
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    const scrollTime = params.get("time");
    if (!roomId) throw new Error("roomId가 URL에 없음");

    const messagesContainer = document.querySelector(".chat-messages");
    let lastMessageDate = null;

    function addMessageToDOM(msg) {
      const isMe = msg.sender.userId === userId;
      const msgDate = new Date(msg.createdAt);
      const localDateStr = msgDate.toLocaleDateString("ko-KR");
      const localTimeStr = msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (lastMessageDate !== localDateStr) {
        const dateDiv = document.createElement("div");
        dateDiv.className = "chat-date";
        dateDiv.textContent = localDateStr;
        messagesContainer.appendChild(dateDiv);
        lastMessageDate = localDateStr;
      }

      const div = document.createElement("div");
      div.className = isMe ? "message me" : "message friend";
      div.dataset.createdAt = msg.createdAt;

      let contentHTML = "";
      switch (msg.type) {
        case "image":
          contentHTML = `<img src="${msg.content}" class="chat-media">`;
          break;
        case "video":
          contentHTML = `<a href="${msg.content}" target="_blank">동영상 보기 ▶</a>`;
          break;
        case "file":
          contentHTML = `<a href="${msg.content}" target="_blank">파일 다운로드 📄</a>`;
          break;
        case "link":
          contentHTML = `<a href="${msg.content}" target="_blank">${msg.content}</a>`;
          break;
        default:
          contentHTML = msg.content;
      }

      div.innerHTML = `
        <img src="${isMe ? "images/9_profile.jpg" : "images/9_카톡 기본프로필 사진.jpg"}" class="chat-img">
        <div class="chat-content">
          <div class="chat-name">${isMe ? "나" : msg.sender.name}</div>
          <div class="bubble-row">
            <div class="bubble">${contentHTML}</div>
            <div class="meta">
              <span class="time">${localTimeStr}</span>
              <button class="checklist-btn" style="margin-left:5px;">📋 할 일</button>
            </div>
          </div>
          <div class="checklist-form" style="display:none; margin-top:5px;">
            <input type="text" placeholder="할 일 입력">
            <button class="checklist-submit">등록</button>
          </div>
        </div>
      `;
      messagesContainer.appendChild(div);

      // 체크리스트 이벤트
      const btn = div.querySelector(".checklist-btn");
      const form = div.querySelector(".checklist-form");
      const submitBtn = div.querySelector(".checklist-submit");
      const input = div.querySelector(".checklist-form input");

      btn.addEventListener("click", () => {
        form.style.display = form.style.display === "none" ? "block" : "none";
      });

      submitBtn.addEventListener("click", async () => {
        const content = input.value.trim();
        if (!content) return;

        const res = await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            roomId,
            messageId: msg._id,
            content,
            createdAt: msg.createdAt,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert("할 일 등록 완료 ✅");
          input.value = "";
          form.style.display = "none";
        } else alert("등록 실패 ❌");
      });
    }

    // ===== 기존 메시지 불러오기 =====
    const res = await fetch(`/api/chatrooms/${encodeURIComponent(roomId)}/messages`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      data.messages.forEach(addMessageToDOM);
      setTimeout(() => {
        if (scrollTime) {
          const target = messagesContainer.querySelector(`[data-created-at="${scrollTime}"]`);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("highlighted");
            setTimeout(() => target.classList.remove("highlighted"), 3000);
          }
        } else {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 0);
    }

    // ===== 소켓 연결 =====
    const socket = io();
    socket.emit("registerUser", userId);
    socket.emit("joinRoom", roomId);

    socket.on("chatMessage", (msg) => {
      addMessageToDOM(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

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
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendTextMessage();
    });

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

      switch (type) {
        case "image":
          content = "https://news.samsungdisplay.com/wp-content/uploads/2018/08/8.jpg";
          break;
        case "video":
          content = "https://youtu.be/YTgazB4a0uY?si=aVUdwWmPiPwnoZ9D";
          break;
        case "file":
          content =
            "http://javakorean.com/wp2/wp-content/uploads/2014/11/2014-HTML5-%EC%9D%B8%ED%84%B0%EB%84%B7%EB%B3%B4%EC%B6%A9%ED%95%99%EC%8A%B5%EC%9E%90%EB%A3%8C-01%EA%B0%95.pdf";
          break;
      }

      socket.emit("chatMessage", { roomId, sender: userId, content, type });
      fileInput.value = "";
    });
  } catch (err) {
    console.error("채팅 불러오기 실패 :", err);
    document.querySelector(".chat-messages").innerHTML = `<div>메시지를 불러올 수 없습니다.</div>`;
  }
  
});