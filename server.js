const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // <-- http 서버 생성
const io = new Server(server); // <-- socket.io 서버 연결

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// ===== 라우터 등록 =====
const userRouter = require("./routes/userRouter");
app.use("/", userRouter);

const chatListRouter = require("./routes/chatListRouter");
app.use("/", chatListRouter);

const chatDetailRouter = require("./routes/chatDetailRouter");
app.use("/", chatDetailRouter);

// ===== 정적 파일 =====
app.use(express.static(path.join(__dirname, "public")));

// ===== MongoDB 연결 =====
mongoose.connect("mongodb://127.0.0.1:27017/chat_service")
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));


// ===== Socket.IO =====
io.on("connection", (socket) => {
  console.log("🔗 새 클라이언트 접속:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 ${socket.id}가 방 ${roomId}에 입장`);
  });

  // ✅ 메시지 전송 이벤트 이름 통일
  socket.on("chatMessage", (data) => {
    const { roomId, sender, content } = data;
    console.log(`💬 [${roomId}] ${sender}: ${content}`);

    // 같은 방의 모든 사람에게 전송
    io.to(roomId).emit("chatMessage", {
      sender,
      content,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ 클라이언트 연결 종료:", socket.id);
  });
});


// 서버 실행
server.listen(3000, () => console.log("🚀 서버 실행 중: http://localhost:3000"));
