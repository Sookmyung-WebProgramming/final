const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());



// ===== 라우터 등록 (static보다 먼저) =====
const userRouter = require("./routes/userRouter");
app.use("/", userRouter);

const chatListRouter = require("./routes/chatListRouter");
app.use("/", chatListRouter);

const chatDetailRouter = require("./routes/chatDetailRouter");
app.use("/", chatDetailRouter);



// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// ===== MongoDB 연결 =====
mongoose.connect("mongodb://127.0.0.1:27017/chat_service")
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

app.listen(3000, () => console.log("🚀 서버 실행 중: http://localhost:3000"));
