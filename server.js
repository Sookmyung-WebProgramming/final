const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const User = require("./models/User");
const ChatMessage = require("./models/Message");

// 미들웨어
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ===== 라우터 등록 =====
const userRouter = require("./routes/userRouter");
app.use("/", userRouter);

const chatListRouter = require("./routes/chatListRouter");
app.use("/", chatListRouter);

const chatDetailRouter = require("./routes/chatDetailRouter");
app.use("/", chatDetailRouter);

const friendsRouter = require("./routes/friends");
app.use("/", friendsRouter);

const chatRoomModule = require("./routes/chatrooms");
app.use("/", chatRoomModule.router);
chatRoomModule.setSocket(io); // Socket.IO 전달

// ===== MongoDB 연결 =====
mongoose.connect("mongodb://127.0.0.1:27017/chat_service")
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// ===== Socket.IO =====
io.on("connection", (socket) => {
  console.log("🔗 새 클라이언트 접속:", socket.id);

  // 로그인 후 userId를 보내면 개인방 join
  socket.on("registerUser", (userId) => {
    socket.join(userId);
    console.log(`🟢 ${userId}가 개인방에 입장`);
  });

  // ===== 메시지 전송 =====
  socket.on("chatMessage", async (data) => {
    const { roomId, sender, content } = data;

    try {
      const user = await User.findOne({ userId: sender });
      if (!user) return console.error(`❌ 유효하지 않은 사용자: ${sender}`);

      const chat = new ChatMessage({
        chatRoom: roomId,
        sender: user._id,
        content,
      });
      const savedChat = await chat.save();

      const populatedChat = await ChatMessage.findById(savedChat._id)
        .populate("sender", "name userId")
        .lean();

      io.to(roomId).emit("chatMessage", populatedChat);
      console.log(`💾 채팅 저장 & 전송 완료: ${populatedChat.content} by ${populatedChat.sender.name}`);
    } catch (err) {
      console.error("❌ 채팅 처리 실패:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ 클라이언트 연결 종료:", socket.id);
  });
});

// 서버 실행
server.listen(3000, () => console.log("🚀 서버 실행 중: http://localhost:3000"));
