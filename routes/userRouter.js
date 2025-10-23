const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

// ===== 로그인 =====
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await userService.login(userId, password);
    if (!user.success && user.message) return res.json(user);

    // JWT 생성
    const token = userService.generateToken(user);

    res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.json({ success: true, message: "로그인 성공", name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ===== 회원가입 =====
router.post("/register", async (req, res) => {
  const { userId, password, name } = req.body;
  try {
    const user = await userService.register(userId, password, name);
    if (!user.success && user.message) return res.json(user);

    // 회원가입 후 자동 로그인
    const token = userService.generateToken(user);
    res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.json({ success: true, message: "회원가입 및 로그인 성공", name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ===== 로그인한 사용자 정보 =====
router.get("/api/me", userService.authenticate, (req, res) => {
  res.json({ success: true, userId: req.user.userId, name: req.user.name });
});

module.exports = router;
