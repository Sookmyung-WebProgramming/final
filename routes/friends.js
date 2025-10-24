const express = require("express");
const router = express.Router();
const User = require("../models/User");
const userService = require("../services/userService");

// 로그인 사용자 친구 목록 가져오기
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
