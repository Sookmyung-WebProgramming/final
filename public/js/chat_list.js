// 페이지 로드
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 로그인 사용자 정보
    const meRes = await fetch("/api/me", { credentials: "include" });
    if (!meRes.ok) throw new Error(`HTTP error! status: ${meRes.status}`);
    const meData = await meRes.json();
    if (!meData.success) throw new Error("로그인 정보 없음");

    // 상단 이름 업데이트
    const userName = meData.user?.name || meData.name || "사용자Id";
    document.getElementById("userId").textContent = userName;

    // 상단 프로필 이미지 업데이트
    const navProfileImg = document.querySelector(".nav-right .profile-img");
    if (navProfileImg) navProfileImg.src = meData.user?.profileImg || "images/9_profile.jpg";

    // 서버에서 채팅 목록 가져오기
    const res = await fetch("/api/chatrooms", { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("채팅 목록 불러오기 실패");

    // 가져온 전체 목록을 'allChatRooms' 변수에 저장
    allChatRooms = data.chatRooms;

    // 분리된 'renderChatList' 함수를 호출해 전체 목록을 처음 출력 
    renderChatList(allChatRooms);

  } catch (err) {
    console.error("채팅 목록 불러오기 실패:", err);
    const chatList = document.getElementById("chatList");
    const chatProfiles = document.getElementById("chatProfiles");
    chatList.innerHTML = `<li>채팅 목록을 불러올 수 없습니다.</li>`;
    chatProfiles.innerHTML = `<li></li>`;
  }
});

// ===================== 채팅방 필터 =======================
// 전체 채팅방 목록을 저장
let allChatRooms = [];

// 채팅 목록을 화면에 그리는 함수
function renderChatList(roomsToDisplay) {
  const chatList = document.getElementById("chatList");

  // 목록을 새로 그리기 전에 기존 내용 비우기 
  chatList.innerHTML = "";

  // 표시할 채팅방이 없는 경우
  if (!roomsToDisplay || roomsToDisplay.length === 0) {
    chatList.innerHTML = `<li><span class="todo-empty">표시할 채팅방이 없습니다.</span></li>`;
    return; // 함수 종료
  }

  // 전달받은 배열(roomsToDisplay)을 기준으로 화면 출력 
  roomsToDisplay.forEach(room => {

    const li = document.createElement("li");
    // 프로필 이미지, 채팅 내용
    li.innerHTML = `
      <a href="9_마라탕공주들_chat_detail.html?roomId=${encodeURIComponent(room._id)}">
      
      <img class="mini-profile" src="${room.profileImg || 'images/9_profile.jpg'}" alt="">
      
      <div class="chat-info">
          <span class="chat-name">${room.name}</span><br>
          <span class="chat-preview">${room.lastSender || ''}: ${room.lastMessage || ''}</span>
        </div>
        <span class="subBox">
          ${room.unreadCount ? `<span class="unread-count">${room.unreadCount}</span>` : ''}
          <span class="cl-time">${room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </span>
      </a>
    `;
    chatList.appendChild(li);
  });
}

// 채팅방 필터 
async function handleChatChange(event) {
  const selectedValue = event.target.value;
  console.log('채팅방 필터 변경:', selectedValue);
  
  // selectedValue 값에 따라 분기 처리
  if (selectedValue === 'allChat') {
    // '전체'를 선택하면, 저장해둔 'allChatRooms' 전체를 출력 
    renderChatList(allChatRooms);

  } else if (selectedValue === 'notReadChat') {
    // '안읽음'을 선택하면, 저장해둔 'allChatRooms' 배열을 filter() 메소드로 필터링
    const unreadRooms = allChatRooms.filter(room => room.unreadCount > 0);
    
    // 필터링된 'unreadRooms' 목록만 출력 
    renderChatList(unreadRooms);
  }
}

// 모든 채팅방 라디오 버튼을 가져오기 
const radioButtons = document.querySelectorAll('.chatroom-list input[type="radio"]');

// 각 라디오 버튼(radio)에 'change' 이벤트가 발생하면 handleChatChange 함수를 실행하도록 연결(attach)
radioButtons.forEach(radio => {
  radio.addEventListener('change', handleChatChange);
});


// ===================== 친구 선택 모달 =====================
const createRoomBtn = document.getElementById("createRoomBtn");
const friendModal = document.getElementById("friendModal");
const closeModal = document.querySelector(".close");
const friendListEl = document.getElementById("friendList");
const createChatRoomConfirm = document.getElementById("createChatRoomConfirm");

let selectedFriends = [];

// 채팅방 만들기 버튼 클릭
createRoomBtn.addEventListener("click", async () => {
  friendModal.style.display = "block";
  friendListEl.innerHTML = "";
  selectedFriends = [];

  try {
    const res = await fetch("/api/users/friends", { credentials: "include" });
    const data = await res.json();
    if (!data.success) throw new Error("친구 목록 불러오기 실패");

    // 에러 처리
    const friends = Array.isArray(data.friends) ? data.friends : [];
    if (friends.length === 0) {
      friendListEl.innerHTML = `<li>친구 목록이 없습니다.</li>`;
      return;
    }

    data.friends.forEach(user => {
      const li = document.createElement("li");
      li.classList.add("friend-item");

      // 체크박스 포함
      li.innerHTML = `
        <label>
          <input type="checkbox" value="${user.userId}">
          ${user.name}
        </label>
      `;

      // 체크박스 클릭 시 선택 표시
      const checkbox = li.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          li.classList.add("selected");
        } else {
          li.classList.remove("selected");
        }
      });

      friendListEl.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    friendListEl.innerHTML = `<li>친구 목록을 불러올 수 없습니다.</li>`;
  }
});

// 모달 닫기
closeModal.addEventListener("click", () => {
  friendModal.style.display = "none";
  document.getElementById("chatRoomName").value = ""; // 채팅방 이름 초기화
  friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
  selectedFriends = [];
});

// 채팅방 생성
createChatRoomConfirm.addEventListener("click", async () => {
  const chatRoomName = document.getElementById("chatRoomName").value.trim();
  selectedFriends = Array.from(friendListEl.querySelectorAll("input[type='checkbox']:checked"))
                         .map(input => input.value);

  if (!chatRoomName) return alert("채팅방 이름을 입력하세요.");
  if (selectedFriends.length === 0) return alert("친구를 최소 1명 선택하세요.");

  try {
    const res = await fetch("/api/chatrooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: chatRoomName,     // 채팅방 이름 포함
        members: selectedFriends
      })
    });
    const data = await res.json();
    if (data.success) {
      alert("채팅방 생성 완료!");
      friendModal.style.display = "none";
      document.getElementById("chatRoomName").value = ""; // 초기화
      friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
      selectedFriends = [];
      location.reload();
    } else {
      alert("채팅방 생성 실패");
    }
  } catch (err) {
    console.error(err);
  }
});

// 모달 외부 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (e.target === friendModal) {
    friendModal.style.display = "none";
    document.getElementById("chatRoomName").value = "";
    friendListEl.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
    selectedFriends = [];
  }
});