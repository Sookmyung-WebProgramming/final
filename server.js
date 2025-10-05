const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const chatService = require("./services/chatService");

const userRoutes = require("./routes/userRoutes");
const chatRoomRoutes = require("./routes/chatRoomRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// REST API
app.use("/", userRoutes);
app.use("/chatroom", chatRoomRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io 통신
io.on("connection", socket => {
  console.log("🟢 사용자 연결됨");

  socket.on("joinRoom", roomId => {
    socket.join(roomId);
    console.log(`사용자가 방 ${roomId}에 입장`);
  });

  socket.on("chatMessage", async msg => {
    const saved = await chatService.saveMessage(msg);
    io.to(msg.roomId).emit("chatMessage", saved);
  });

  socket.on("disconnect", () => console.log("🔴 사용자 연결 종료"));
});

// 서버 시작
connectDB();

// Render 배포용: 환경변수 PORT 사용
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));