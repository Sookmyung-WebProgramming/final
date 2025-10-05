const mongoose = require("mongoose");

async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI; // 환경변수 사용
    if (!mongoURI) throw new Error("MongoDB URI is not set in environment variables");
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

module.exports = connectDB;