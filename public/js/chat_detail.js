const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
const userId = urlParams.get("userId");

async function loadMessages() {
  const res = await fetch(`/chat/rooms/${roomId}/messages/${userId}`);
  const data = await res.json();
  if (!data.success) return;

  const chatMessages = document.querySelector(".chat-messages");
  chatMessages.innerHTML = "";

  data.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.sender.name === userId ? "message me" : "message friend";
    div.innerHTML = `
      <img src="images/9_profile.jpg" class="chat-img">
      <div class="chat-content">
        <div class="chat-name">${msg.sender.name}</div>
        <div class="bubble-row">
          <div class="bubble">${msg.content}</div>
          <div class="meta"><span class="time">${new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(div);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

loadMessages();

// 메시지 전송
document.querySelector(".send-btn").addEventListener("click", async () => {
  const input = document.querySelector(".chat-input input[type=text]");
  if (!input.value) return;

  await fetch(`/chat/rooms/${roomId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId: userId, content: input.value })
  });

  input.value = "";
  loadMessages();
});