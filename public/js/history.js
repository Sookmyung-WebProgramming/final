document.addEventListener("DOMContentLoaded", async () => {
  console.log("📌 history.js 시작");

  // ✅ 로그인 확인
  try {
    console.log("🔹 로그인 정보 요청 중...");
    const meRes = await fetch("/api/me", { credentials: "include" });
    const meData = await meRes.json();

    if (!meData.success) throw new Error("로그인 정보 없음");
    document.getElementById("userId").textContent = meData.name;
    console.log("✅ 로그인 완료:", meData.name);
  } catch (err) {
    console.error("❌ 로그인 실패:", err);
    alert("로그인 후 이용 가능합니다.");
    return;
  }

  // ✅ 보관함 불러오기
  const grid = document.querySelector(".history-media-grid");

  try {
    console.log("📦 /api/history 호출 중...");
    const res = await fetch("/api/history", { credentials: "include" });
    const data = await res.json();
    console.log("📦 /api/history 응답:", data);

    if (!data.success || !data.items) throw new Error("데이터 로드 실패");
    grid.innerHTML = "";

    data.items.forEach(item => {
      console.log("🔹 아이템 처리 중:", item); // 🔹 각 item 로그

      const date = new Date(item.createdAt);
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")} • ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;

      // ✅ 썸네일 생성
      let thumbHtml = "";
      if (item.type === "image") {
        thumbHtml = `<img src="${item.content}" alt="이미지" />`;
      } else if (item.type === "video") {
        thumbHtml = `<video src="${item.content}" muted preload="metadata"></video>`;
      } else if (item.type === "file" || item.type === "link") {
        thumbHtml = `<img src="../images/9_logo.svg" alt="파일/링크" />`;
      } else {
        thumbHtml = `<div class="unknown-thumb">?</div>`;
      }

      // ✅ HTML 구조
      const html = `
        <div class="media-item">
          <!-- 1️⃣ 썸네일 클릭 시 외부 링크 -->
          <a class="media-thumb" href="${item.content}" target="_blank" rel="noopener noreferrer">
            ${thumbHtml}
            <button class="fav-btn">★</button>
          </a>

          <!-- 2️⃣ 메타 클릭 시 채팅 시점으로 이동 -->
          <div class="media-meta"
               data-room-id="${item.chatRoomId}"
               data-message-id="${item._id}"
               data-created-at="${item.createdAt}">
            <p class="media-title">${item.senderName || "알 수 없음"} : ${item.content}</p>
            <p class="media-date">${formatted}</p>
          </div>
        </div>
      `;

      grid.insertAdjacentHTML("beforeend", html);

      // 🔹 삽입 후 dataset 로그
      const insertedMeta = grid.lastElementChild.querySelector(".media-meta");
      console.log("🔹 dataset 확인:", insertedMeta.dataset);
    });

  } catch (err) {
    console.error("❌ 보관함 데이터 로드 실패:", err);
    grid.innerHTML = `<p style="color:red;">보관함 데이터를 불러오지 못했습니다.</p>`;
  }

  // ✅ 메타 클릭 시 채팅 시점으로 이동
  grid.addEventListener("click", (e) => {
    const meta = e.target.closest(".media-meta");
    if (meta) {
      const roomId = meta.dataset.roomId;
      const createdAt = meta.dataset.createdAt;
      console.log("🔹 클릭된 메타 dataset:", meta.dataset); // 🔹 클릭 로그

      if (roomId && createdAt) {
        console.log(`🔹 이동: room=${roomId}, time=${createdAt}`);
        window.location.href = `/9_마라탕공주들_chat_detail.html?roomId=${encodeURIComponent(roomId)}&time=${encodeURIComponent(createdAt)}`;
      } else {
        console.warn("⚠️ roomId 또는 createdAt이 undefined입니다.");
      }
    }
  });
});
