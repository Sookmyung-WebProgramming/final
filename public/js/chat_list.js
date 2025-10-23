document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/chatrooms", { credentials: "include" });
    const data = await res.json();
    if (!data.success) return;

    const chatList = document.querySelector(".list-chat ul");
    chatList.innerHTML = "";

    data.chatRooms.forEach(room => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="9_마라탕공주들_chat_detail.html?room=${encodeURIComponent(room.name)}">
          <div class="chat-info">
            <span class="chat-name">${room.name}</span><br>
            <span class="chat-preview">${room.lastSender}: ${room.lastMessage}</span>
          </div>
          <span class="subBox">
            <span class="unread-count">${room.unreadCount}</span>
            <img class="icon ${room.favorite ? "" : "not"}" src="images/9_star_50dp_8050F2.svg" alt="">
            <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </a>
      `;
      chatList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
});