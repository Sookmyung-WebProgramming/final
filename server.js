const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// ===== 앱/서버 설정 =====
const app = express();
const server = http.createServer(app);

// ===== Socket.IO 설정 =====
const io = new Server(server, {
  cors: { origin: "*" } // 모든 도메인 허용
});

// ===== 모델 =====
const User = require("./models/User");
const ChatMessage = require("./models/Message");
const ChatRoom = require("./models/chatRoom");
const ChatRoomUserStatus = require("./models/ChatRoomUserStatus");

// ===== 미들웨어 =====
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ===== 라우터 등록 =====
const chatDetailRouter = require("./routes/chatDetailRouter");
const chatListRouter = require("./routes/chatListRouter");
const checklistRouter = require("./routes/checklistRouter");
const historyRouter = require("./routes/historyRouter");
const userRouter = require("./routes/userRouter");

app.use("/", chatDetailRouter);
app.use("/", chatListRouter);
app.use("/", checklistRouter);
app.use("/", historyRouter);
app.use("/", userRouter);

// ===== 정적 파일 서빙 =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "9_마라탕공주들_index.html"));
});

// ===== MongoDB 연결 =====
mongoose.connect(process.env.MONGODB_URI_PROD, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Atlas 연결 성공"))
  .catch((err) => console.error("❌ MongoDB Atlas 연결 실패 :", err));

// ===== 메시지 타입 판단 =====
function determineMessageType(content) {
  if (/\.jpg$|\.png$|\.jpeg$/i.test(content)) return "image";
  if (/\.mp4$|\.mov$|\.avi$/i.test(content)) return "video";
  if (/\.xlsx$|\.pdf$|\.docx$/i.test(content)) return "file";
  if (/^https?:\/\//i.test(content)) return "link";
  return "text";
}

function convertToSampleLink(content) {
  const type = determineMessageType(content);
  switch(type) {
    case "image": return "https://news.samsungdisplay.com/wp-content/uploads/2018/08/8.jpg";
    case "video": return "https://youtu.be/YTgazB4a0uY?si=aVUdwWmPiPwnoZ9D";
    case "file":  return "http://javakorean.com/wp2/wp-content/uploads/2014/11/2014-HTML5-%EC%9D%B8%ED%84%B0%EB%84%B4%EB%B3%B4%EC%B6%A9%ED%95%99%EC%8A%B5%EC%9E%90%EB%A3%8C-01%EA%B0%95.pdf";
    case "link":  return content;
    case "text":  return content;
  }
}

// ===== Socket.IO 처리 =====
const roomMembers = new Map(); // key: roomId, value: Set(userIds)

io.on("connection", (socket) => {
  console.log("새 클라이언트 접속:", socket.id);

  socket.on("registerUser", (userId) => {
    socket.userId = userId;
    console.log(`${socket.id}에 userId 등록: ${userId}`);
  });

  socket.on("joinRoom", async (roomId) => {
    if (!socket.userId) return socket.emit("error", "먼저 userId를 등록해주세요");

    socket.join(roomId);
    console.log(`${socket.userId}가 방 ${roomId}에 입장`);

    if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Set());
    roomMembers.get(roomId).add(socket.userId);

    try {
      const user = await User.findOne({ userId: socket.userId });
      if (!user) return;

      const lastMessage = await ChatMessage.findOne({ chatRoom: roomId })
        .sort({ createdAt: -1 })
        .lean();
      const now = lastMessage ? lastMessage.createdAt : new Date();

      await ChatRoomUserStatus.findOneAndUpdate(
        { chatRoom: roomId, user: user._id },
        { lastReadAt: now },
        { upsert: true }
      );
    } catch (err) {
      console.error("joinRoom lastReadAt 처리 실패 : ", err);
    }
  });

  socket.on("leaveRoom", (roomId) => {
    if (socket.userId && roomMembers.has(roomId)) {
      roomMembers.get(roomId).delete(socket.userId);
      console.log(`${socket.userId}가 방 ${roomId} 퇴장`);
    }
    socket.leave(roomId);
  });

  socket.on("chatMessage", async (data) => {
    const { roomId, sender, content } = data;
    if (!sender || !roomId) return;

    try {
      const user = await User.findOne({ userId: sender });
      if (!user) return;

      const type = determineMessageType(content);
      const finalContent = convertToSampleLink(content);

      const chat = new ChatMessage({
        chatRoom: new mongoose.Types.ObjectId(roomId),
        sender: user._id,
        content: finalContent,
        type,
      });
      const savedChat = await chat.save();

      await ChatRoom.findByIdAndUpdate(roomId, {
        lastMessage: {
          content: savedChat.content,
          sender: savedChat.sender,
          createdAt: savedChat.createdAt,
        },
        updatedAt: new Date(),
      });

      const members = roomMembers.get(roomId);
      if (members && members.size > 0) {
        for (const memberUserId of members) {
          const member = await User.findOne({ userId: memberUserId });
          if (!member) continue;
          await ChatRoomUserStatus.findOneAndUpdate(
            { chatRoom: roomId, user: member._id },
            { lastReadAt: new Date() },
            { upsert: true }
          );
        }
      }

      const populatedChat = await ChatMessage.findById(savedChat._id)
        .populate("sender", "name userId")
        .lean();

      io.to(roomId).emit("chatMessage", populatedChat);
      console.log(`저장 & 전송 완료 : ${populatedChat.content} [${populatedChat.type}] by ${populatedChat.sender.name}`);
    } catch (err) {
      console.error("채팅 처리 실패 : ", err);
    }
  });

  socket.on("disconnect", () => {
    for (const [roomId, members] of roomMembers.entries()) {
      members.delete(socket.userId);
    }
    console.log("클라이언트 연결 종료 : ", socket.id);
  });
});

// ===== 서버 실행 =====
const PORT = 3000;
const HOST = "0.0.0.0";
const IP = "172.30.1.15";

server.listen(PORT, HOST, () => {
  console.log(`서버 실행 중 : http://${IP}:${PORT}`);
});
