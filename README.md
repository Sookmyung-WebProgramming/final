# 💬 송이톡 (Chat Application Server)

Node.js 기반 실시간 채팅 서버입니다.  
MongoDB Atlas(클라우드 DB)를 사용하며 Socket.IO로 실시간 메시지를 처리합니다.

---

## 📌 사용 기술

- Node.js + Express
- MongoDB Atlas
- Socket.IO (실시간 통신)

---

## 🚀 실행 방법

아래 순서대로 따라 하시면 프로젝트를 실행할 수 있습니다.

---

### 1️⃣ Node.js 설치 확인
node -v
npm -v

### 2️⃣ 프로젝트 패키지 설치
npm install

### 3️⃣ IP 주소 설정
1. cmd 실행 후 명령어 입력 : ipconfig 
2. IPv4 주소를 확인한 뒤 server.js 의 마지막 부분을 아래처럼 수정합니다.
   const IP = "위의 IPv4 주소";
   
### 4️⃣ 서버 실행
npm start

### 정상 실행 예시
✅ MongoDB Connected
🚀 Server running on http://172.20.57.49:3000

### 5️⃣ 브라우저에서 접속
http://(위의 IP):3000/login.html
동일한 Wi-Fi 네트워크에 연결된 모든 기기에서 접속 가능합니다.

---

## 📌 시연 안내
본 프로젝트는 실시간 채팅 기능을 포함하고 있어,
시연 시 교수님 기기와 팀원 기기 간 메시지가 즉시 전달되는 모습을 확인하실 수 있습니다.