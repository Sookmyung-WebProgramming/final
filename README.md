# 💬 송이톡 (Chat App Server)

Node.js + Express + MongoDB 기반 실시간 채팅 서버  
MongoDB Atlas 클라우드 DB 연결 + Socket.IO 실시간 통신 지원

---

## 📦 프로젝트 개요

| 구분 | 내용 |
|------|------|
| 개발 환경 | Node.js v22+, Express, MongoDB Atlas |
| 주요 기능 | 회원가입 / 로그인, 친구 추가, 실시간 채팅, 메시지 읽음 처리, 체크리스트, 보관함, 설정 |
| DB | MongoDB Atlas (Cloud) |
| 실행 방식 | npm start |

---

## ⚙️ 실행 전 준비사항

1. Node.js 설치  
- Node.js 공식 사이트 접속  
- LTS 버전 다운로드 및 설치  
- 설치 확인:  
node -v
npm -v

markdown
코드 복사

2. 프로젝트 클론  
git clone https://github.com/계정명/레포명.git
cd 레포명

markdown
코드 복사

3. 의존성 설치  
npm install

markdown
코드 복사

4. 환경변수 설정  
- 프로젝트 루트(server/)에 .env 파일 추가  
- 예시:  
PORT=3000
MONGO_URI=mongodb+srv://<유저이름>:<비밀번호>@<클러스터주소>/<DB이름>

bash
코드 복사
⚠️ .env 파일은 보안상 깃허브에 포함하지 않습니다. 팀 내에서 공유된 파일 사용

5. 서버 실행  
npm start

diff
코드 복사
- 정상 실행 시 출력 예시:  
✅ MongoDB 연결 성공
🚀 Server running on http://localhost:3000

yaml
코드 복사

---

## 🧪 테스트

- 브라우저 또는 Postman에서 확인:  
http://localhost:3000/api/

yaml
코드 복사

---

## 📂 프로젝트 구조

server/
┣ models/ # Mongoose 스키마 정의
┣ routes/ # Express 라우터 (user, chat 등)
┣ services/ # 인증/비즈니스 로직
┣ server.js # 서버 실행 진입점
┣ .env # 환경변수 (비공개)
┣ package.json # 의존성 및 실행 스크립트

yaml
코드 복사

---

## 📚 참고 자료

- MongoDB Atlas 공식 문서: https://www.mongodb.com/docs/atlas/  
- Express 공식 문서: https://expressjs.com/  
- Socket.IO 공식 문서: https://socket.io/docs/  

---

© 2025 Sookmyung Web Programming Team. All rights reserved.