document.addEventListener("DOMContentLoaded", async () => {

  // 로그인 정보 불러오기
  const meRes = await fetch("/api/me", { credentials: "include" });
  const meData = await meRes.json();
  if (!meData.success) return alert("로그인이 필요합니다.");

  document.getElementById("userId").textContent = meData.name;

  // ===== 요소 가져오기 =====
  const searchInput = document.getElementById("userSearchInput");
  const searchModal = document.getElementById("searchModal");
  const searchList = document.getElementById("modalSearchList");
  const closeSearchModal = document.getElementById("closeSearchModal");

  const userDetailModal = document.getElementById("userDetailModal");
  const userDetailContainer = document.getElementById("userDetailContainer");
  const closeUserDetailModal = document.getElementById("closeUserDetailModal");

  if (!searchInput) {
    return;
  }

  // ===== 실시간 검색 =====
  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query.length < 1) {
      searchModal.style.display = "none";
      return;
    }

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      });
      const data = await res.json();

      searchList.innerHTML = "";
      if (!data.success || data.users.length === 0) {
        searchList.innerHTML = "<li>검색 결과가 없습니다.</li>";
        searchModal.style.display = "block";
        return;
      }

      // 검색 결과 렌더링
      data.users.forEach((user) => {
        const li = document.createElement("li");
        li.classList.add("user-item");
        li.innerHTML = `
          <img src="${user.profileImg || 'images/9_people.png'}" width="40" height="40" style="border-radius:50%;">
          <strong>${user.name}</strong> (@${user.userId})
        `;
        li.addEventListener("click", () => showUserDetail(user));
        searchList.appendChild(li);
      });
      searchModal.style.display = "block";
    } catch (err) {
      console.error("❌ 검색 오류:", err);
      alert("검색 중 문제가 발생했습니다.");
    }
  });

  // ===== 상세 모달 표시 =====
  function showUserDetail(user) {
    searchModal.style.display = "none";
    userDetailContainer.innerHTML = `
      <div style="text-align:center;">
        <img src="${user.profileImg || 'images/9_people.png'}" width="80" height="80" style="border-radius:50%;"><br>
        <h3>${user.name}</h3>
        <p>@${user.userId}</p>
        ${
          user.isFriend
            ? `<p style="color:gray;">이미 친구입니다.</p>`
            : `<button id="addFriendBtn" data-id="${user._id}">친구 등록하기</button>`
        }
      </div>
    `;
    userDetailModal.style.display = "block";

    const addBtn = document.getElementById("addFriendBtn");
    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            const id = addBtn.dataset.id; 

            try {
            const res = await fetch(`/api/friends/${id}`, {  
                method: "POST",
                credentials: "include",
            });
            const result = await res.json();
            alert(result.message);

            if (result.success) {
                addBtn.outerHTML = `<p style="color:gray;">이미 친구입니다.</p>`;
            }
            } catch (err) {
            console.error("친구 추가 오류:", err);
            alert("친구 추가 중 오류가 발생했습니다.");
            }
        });
    }
}

  // 모달 닫기 이벤트
  closeSearchModal.onclick = () => (searchModal.style.display = "none");
  closeUserDetailModal.onclick = () => (userDetailModal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === searchModal) searchModal.style.display = "none";
    if (e.target === userDetailModal) userDetailModal.style.display = "none";
  };

});