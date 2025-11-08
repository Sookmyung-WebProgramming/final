# 💬 송이톡 (Chat App Server)

Node.js + Express + MongoDB 기반 **실시간 채팅 서버**  
MongoDB Atlas 클라우드 DB 연결 + Socket.IO 실시간 통신 지원

---

## 📦 프로젝트 개요

| 구분 | 내용 |
|------|------|
| **개발 환경** | Node.js v22+, Express, MongoDB Atlas |
| **주요 기능** | 회원가입 / 로그인, 친구 추가, 실시간 채팅, 메시지 읽음 처리, 체크리스트, 보관함, 설정 |
| **DB** | MongoDB Atlas (Cloud) |
| **실행 방식** | `npm start` |

---

## ⚙️ 실행 전 준비사항

### 1️⃣ Node.js 설치
- [Node.js 공식 사이트](https://nodejs.org/) 접속
- LTS 버전 다운로드 및 설치
- 설치 확인
```bash
node -v
npm -v
``````

### 2️⃣ 프로젝트 클론
```bash
git clone https://github.com/Sookmyung-WebProgramming/final.git
cd final 
``````

### 3️⃣ 의존성 설치
```bash
npm install
``````

### 4️⃣ 환경변수 설정
프로젝트 루트(server/)에 .env 파일 추가
```bash
PORT=3000
MONGO_URI=mongodb+srv://<유저이름>:<비밀번호>@<클러스터주소>/<DB이름>
`````` 
⚠️ .env 파일은 보안상 GitHub에 포함하지 않음. 팀 내 공유 파일 사용

### 5️⃣ 서버 실행
```bash
npm start
``````

### 정상 실행 시 출력 예시
```bash
✅ MongoDB 연결 성공
🚀 Server running on http://localhost:3000
``````

## 🧪 테스트
브라우저 또는 Postman에서 확인
```bash
http://localhost:3000/9_%EB%A7%88%EB%9D%BC%ED%83%95%EA%B3%B5%EC%A3%BC%EB%93%A4_login.html
``````

## 📚 참고 자료
- MongoDB Atlas 공식 문서
- Express 공식 문서
- Socket.IO 공식 문서

© 2025 Sookmyung Web Programming Team. All rights reserved.
