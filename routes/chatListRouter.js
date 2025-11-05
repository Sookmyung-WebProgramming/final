const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ChatRoom = require("../models/chatRoom"); 
const Message = require("../models/Message");
const ChatRoomUserStatus = require("../models/ChatRoomUserStatus");
const User = require("../models/User");
const userService = require("../services/userService");

// 채팅 목록 API
router.get("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    // 1️. Mongo ObjectId 가져오기
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "사용자 없음" });
    const mongoUserId = user._id;

    // 2️. 채팅방 조회
    const rooms = await ChatRoom.find({ members: user.userId })
      .sort({ updatedAt: -1 })
      .populate("lastMessage.sender", "name")
      .lean();

    const chatRooms = await Promise.all(
      rooms.map(async (r) => {

        // 3️. 읽음 상태 조회
        let status = await ChatRoomUserStatus.findOne({ chatRoom: r._id, user: mongoUserId });

        // 4️. 읽음 상태 초기화
        if (!status) {
          status = await ChatRoomUserStatus.create({
            chatRoom: r._id,
            user: mongoUserId,
            lastReadAt: new Date()
          });
        } else if (!status.lastReadAt) {
          status.lastReadAt = new Date();
          await status.save();
        }

        // 5️. 읽지 않은 메시지 수 계산
        const lastReadAt = new Date(status.lastReadAt);
        const unreadCount = await Message.countDocuments({
          chatRoom: r._id,
          createdAt: { $gt: lastReadAt },
          sender: { $ne: mongoUserId }
        });

        return {
          _id: r._id,
          name: r.name,
          lastSender: r.lastMessage?.sender?.name || "알 수 없음",
          lastMessage: r.lastMessage?.content || "최근 메시지 없음",
          updatedAt: r.updatedAt,
          unreadCount
        };
      })
    );

    res.json({ success: true, chatRooms });
  } catch (err) {
    console.error("채팅방 목록 조회 실패:", err);
    res.json({ success: false, error: err.message });
  }
});

// 새 채팅방 생성 API
router.post("/api/chatrooms", userService.authenticate, async (req, res) => {
  try {
    const { name, members } = req.body; 
    if (!members || members.length === 0) 
      return res.json({ success: false, message: "친구 선택 필요" });
    if (!name || name.trim() === "") 
      return res.json({ success: false, message: "채팅방 이름 필요" });

    // 로그인 사용자도 멤버에 포함
    const roomMembers = [req.user.userId, ...members];

    const newRoom = new ChatRoom({ name, members: roomMembers });
    await newRoom.save();

    res.json({ success: true, roomId: newRoom._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// 사용자 친구 목록 가져오기 API 
router.get("/api/users/friends", userService.authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).populate("friends", "name userId");
    if (!user) return res.json({ success: false, message: "사용자 없음" });

    res.json({ success: true, friends: user.friends });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "친구 목록 불러오기 실패" });
  }
});

module.exports = router;