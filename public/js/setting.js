// ---------- 로그인 및 프로필 초기화 ----------
async function initUser() {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.user) {
      location.href = "/9_마라탕공주들_login.html";
      return;
    }
    const user = data.user;
    document.getElementById("userId").textContent = user?.name;
    document.querySelector(".profile-img").src = user.profileImg || "images/9_profile.jpg";
    document.getElementById("previewImg").src = user.profileImg || "images/9_profile.jpg";
    document.getElementById("profileImgInput").value = user.profileImg || "";
    document.getElementById("profileMsgInput").value = user.profileMessage || "";
  } catch (err) {
    console.error(err);
    location.href = "/9_마라탕공주들_login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initUser();

  // 로컬 설정 초기화
  if (pushToggle) pushToggle.checked = localStorage.getItem("push") === "on";
  if (soundToggle) soundToggle.checked = localStorage.getItem("sound") === "on";
  if (themeSelect) {
    themeSelect.value = localStorage.getItem("theme") || "system";
    applyTheme(themeSelect.value);
  }

  // 친구 목록 불러오기
  loadFriends();
});

// ---------- 프로필 저장 ----------
document.getElementById("saveBtn")?.addEventListener("click", async () => {
  const profileImg = document.getElementById("profileImgInput").value.trim();
  const profileMessage = document.getElementById("profileMsgInput").value.trim();
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ profileImg, profileMessage })
    });
    const data = await res.json();
    if (data.success) {
      alert("프로필이 수정되었습니다!");
      const newImg = profileImg || "images/9_profile.jpg";
      document.querySelector(".profile-img").src = newImg;
      document.getElementById("previewImg").src = newImg;
      location.href = "/9_마라탕공주들_setting.html";
    } else alert(data.message || "수정 실패");
  } catch (err) { alert("프로필 수정 중 오류가 발생했습니다."); }
});

// ---------- 이미지 미리보기 ----------
document.getElementById("profileImgInput")?.addEventListener("input", (e) => {
  document.getElementById("previewImg").src = e.target.value.trim() || "images/9_profile.jpg";
});

// ---------- 취소 ----------
document.getElementById("cancelBtn")?.addEventListener("click", () => {
  location.href = "/9_마라탕공주들_setting.html";
});

// ---------- 로컬 설정 ----------
const pushToggle = document.getElementById("pushToggle");
const soundToggle = document.getElementById("soundToggle");
const themeSelect = document.getElementById("themeSelect");

pushToggle?.addEventListener("change", () => localStorage.setItem("push", pushToggle.checked ? "on" : "off"));
soundToggle?.addEventListener("change", () => localStorage.setItem("sound", soundToggle.checked ? "on" : "off"));
themeSelect?.addEventListener("change", (e) => {
  localStorage.setItem("theme", e.target.value);
  applyTheme(e.target.value);
});
function applyTheme(theme) { document.documentElement.dataset.theme = theme; }

// ---------- 로그아웃 ----------
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
  location.href = "/9_마라탕공주들_login.html";
});

// ---------- 데이터 초기화 ----------
document.getElementById("resetDataBtn")?.addEventListener("click", () => {
  if (confirm("모든 설정을 초기화하시겠습니까?")) {
    localStorage.clear();
    location.reload();
  }
});

// ---------- 친구 목록 관리 ----------
async function loadFriends() {
  try {
    const res = await fetch("/api/friends", { credentials: "include" });
    const data = await res.json();
    if (!data.success) return;

    const friendListElem = document.getElementById("friendList");
    const nonFriendListElem = document.getElementById("nonFriendList");

    friendListElem.innerHTML = data.friends.length
      ? data.friends.map(f => `<li><span><img src="${f.profileImg||'images/9_people.png'}">${f.name} (@${f.userId})</span><button class="remove-btn" data-id="${f._id}">삭제</button></li>`).join("")
      : `<li class="empty-friends">친구가 없습니다.</li>`;

    nonFriendListElem.innerHTML = data.nonFriends.length
      ? data.nonFriends.map(u => `<li><span><img src="${u.profileImg||'images/9_people.png'}">${u.name} (@${u.userId})</span><button class="add-btn" data-id="${u._id}">친구 추가</button></li>`).join("")
      : `<li class="empty-friends">추천 친구가 없습니다.</li>`;

  } catch (err) { console.error(err); }
}

// 이벤트 위임으로 친구 추가/삭제
document.body.addEventListener("click", async e => {
  if (e.target.classList.contains("remove-btn")) {
    const id = e.target.dataset.id;
    if (!confirm("정말 친구를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/friends/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (data.success) {
      // 삭제 후 전체 목록 새로 불러오기
      loadFriends();
    } else {
      alert(data.message || "삭제 실패");
    }
  }
  if (e.target.classList.contains("add-btn")) {
    const id = e.target.dataset.id;
    const res = await fetch(`/api/friends/${id}`, { method: "POST", credentials: "include" });
    const data = await res.json();
    if (data.success) {
      loadFriends(); // 추가 후 목록 새로고침
    } else {
      alert(data.message || "추가 실패");
    }
  }
});