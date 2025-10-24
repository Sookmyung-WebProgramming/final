document.addEventListener("DOMContentLoaded", async () => {
  console.log("📌 history.js 시작");

  // 로그인 먼저 확인
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

  // 보관함 데이터 불러오기
  const grid = document.querySelector(".history-media-grid");

  try {
    console.log("📦 /api/history 호출 중...");
    const res = await fetch("/api/history", { credentials: "include" });
    const data = await res.json();
    console.log("📦 /api/history 응답:", data);

    if (!data.success || !data.items) throw new Error("데이터 로드 실패");

    grid.innerHTML = "";

    data.items.forEach(item => {
      const date = new Date(item.createdAt);
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} • ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

      let thumbHtml = "";
      if (item.type === "image") {
        thumbHtml = `<img src="${item.content}" alt="이미지" />`;
      } else if (item.type === "video") {
        thumbHtml = `<video src="${item.content}" muted preload="metadata"></video>`;
      } else if (item.type === "file") {
        thumbHtml = `<img src="../images/9_logo.svg" alt="파일" />`;
      } else {
        thumbHtml = `<div class="unknown-thumb">?</div>`;
      }

      const html = `
        <a class="media-item" href="${item.content}" target="_blank">
          <div class="media-thumb">
            ${thumbHtml}
            <button class="fav-btn">★</button>
          </div>
          <div class="media-meta">
            <p class="media-title">${item.senderName} : ${item.content}</p>
            <p class="media-date">${formatted}</p>
          </div>
        </a>
      `;
      grid.insertAdjacentHTML("beforeend", html);
    });

  } catch (err) {
    console.error("❌ 보관함 데이터 로드 실패:", err);
    grid.innerHTML = `<p style="color:red;">보관함 데이터를 불러오지 못했습니다.</p>`;
  }
});
