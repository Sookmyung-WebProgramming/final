const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/chatapp");
    console.log("=======MongoDB connected=======");
  } catch (err) {
    console.error("MongoDB connection failed :", err);
  }
}

module.exports = connectDB;