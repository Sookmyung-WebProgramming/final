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
const ChatRoom = require("./models/ChatRoom"); // ChatRoom 모델 필요

// 미들웨어
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ===== 라우터 등록 =====
const userRouter = require("./routes/userRouter");
const chatListRouter = require("./routes/chatListRouter");
const friendsRouter = require("./routes/friends");
const chatRoomRouter = require("./routes/chatrooms");
const chatDetailRouter = require("./routes/chatDetailRouter");
const checklistRouter = require("./routes/checklistRouter");
const historyRouter = require("./routes/history");

app.use("/", userRouter);
app.use("/", chatListRouter);
app.use("/", friendsRouter);
app.use("/", chatRoomRouter);
app.use("/", chatDetailRouter);
app.use("/", checklistRouter);
app.use("/", historyRouter);

// ===== MongoDB 연결 =====
mongoose.connect("mongodb://127.0.0.1:27017/chat_service")
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// 메시지 타입 판단
function determineMessageType(content) {
  if (/\.jpg$|\.png$|\.jpeg$/i.test(content)) return "image";
  if (/\.mp4$|\.mov$|\.avi$/i.test(content)) return "video";
  if (/\.xlsx$|\.pdf$|\.docx$/i.test(content)) return "file";   // file 먼저
  if (/^https?:\/\//i.test(content)) return "link";
  return "text";
}

// 샘플 링크 변환
function convertToSampleLink(content) {
  const type = determineMessageType(content);
  switch(type) {
    case "image": return "https://news.samsungdisplay.com/wp-content/uploads/2018/08/8.jpg";
    case "video": return "https://youtu.be/YTgazB4a0uY?si=aVUdwWmPiPwnoZ9D";
    case "file":  return "http://javakorean.com/wp2/wp-content/uploads/2014/11/2014-HTML5-%EC%9D%B8%ED%84%B0%EB%84%B7%EB%B3%B4%EC%B6%A9%ED%95%99%EC%8A%B5%EC%9E%90%EB%A3%8C-01%EA%B0%95.pdf";
    case "link":  return content;
    case "text":  return content;
  }
}

// Socket.IO
io.on("connection", (socket) => {
  console.log("🔗 새 클라이언트 접속:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 ${socket.id}가 방 ${roomId}에 입장`);
  });

  socket.on("chatMessage", async (data) => {
    const { roomId, sender, content } = data;

    try {
      const user = await User.findOne({ userId: sender });
      if (!user) return console.error(`❌ 유효하지 않은 사용자: ${sender}`);

      const type = determineMessageType(content);
      const finalContent = convertToSampleLink(content);

      const chat = new ChatMessage({
        chatRoom: roomId,
        sender: user._id,
        content: finalContent,
        type
      });
      const savedChat = await chat.save();

      const populatedChat = await ChatMessage.findById(savedChat._id)
        .populate("sender", "name userId")
        .lean();

      io.to(roomId).emit("chatMessage", populatedChat);
      console.log(`💾 저장 & 전송 완료: ${populatedChat.content} [${populatedChat.type}] by ${populatedChat.sender.name}`);

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
