const express = require("express");
const router = express.Router();
const User = require("../models/User"); 
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

// ===== 로그아웃 =====
router.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
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

// 로그인한 사용자 정보 가져오기 API 
router.get("/api/me", userService.authenticate, async (req, res) => {
  try {

    const user = await User.findOne({ userId: req.user.userId })
      .select("-password") // 비밀번호 제외
      .populate("friends", "userId name profileImg");

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    res.json({
      success: true,
      user, // user 필드 안에 데이터 담김
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 사용자 검색 API
router.get("/api/users/search", userService.authenticate, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json({ success: false, message: "검색어 누락" });

    const me = await User.findOne({ userId: req.user?.userId }).populate("friends");
    if (!me) return res.status(404).json({ success: false, message: "로그인 정보 불일치" });

    const users = await User.find({
      userId: { $regex: query, $options: "i" },
      _id: { $ne: me._id },
    }).lean();

    const result = users.map((u) => ({
      ...u,
      isFriend: me.friends?.some((f) => f._id.toString() === u._id.toString()) || false,
    }));

    res.json({ success: true, users: result });
  } catch (err) {
    console.error("검색 오류 : ", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 친구 추가 API 
router.post("/api/friends/:id", userService.authenticate, async (req, res) => {
  try {
    const myUserIdStr = req.user?.userId; // 로그인된 사용자
    const targetObjectId = req.params.id; // 상대방의 _id

    if (!myUserIdStr || !targetObjectId)
      return res.status(400).json({ success: false, message: "ID 누락" });

    const me = await User.findOne({ userId: myUserIdStr });
    if (!me)
      return res.status(404).json({ success: false, message: "사용자 없음" });

    // 자기 자신 방지
    if (me._id.toString() === targetObjectId)
      return res.status(400).json({ success: false, message: "자기 자신은 추가 불가" });

    const target = await User.findById(targetObjectId);
    if (!target)
      return res.status(404).json({ success: false, message: "대상 사용자 없음" });

    const alreadyFriends = me.friends?.some(f => f.toString() === target._id.toString());
    if (alreadyFriends)
      return res.status(400).json({ success: false, message: "이미 친구입니다." });

    me.friends.push(target._id);
    target.friends.push(me._id);
    await me.save();
    await target.save();

    res.json({ success: true, message: "친구로 등록되었습니다!" });
  } catch (err) {
    console.error("친구 추가 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 친구 목록 불러오기 API 
router.get("/api/friends", userService.authenticate, async (req, res) => {
  const me = await User.findOne({ userId: req.user.userId }).populate("friends");
  const allUsers = await User.find({ _id: { $ne: me._id } });

  const friends = me.friends.map(f => ({
    _id: f._id,
    userId: f.userId,
    name: f.name,
    profileImg: f.profileImg
  }));

  const nonFriends = allUsers
    .filter(u => !me.friends.some(f => f._id.equals(u._id)))
    .map(u => ({
      _id: u._id,
      userId: u.userId,
      name: u.name,
      profileImg: u.profileImg
    }));

  res.json({ success: true, friends, nonFriends });
});

// 친구 삭제 API 
router.delete("/api/friends/:friendId", userService.authenticate, async (req, res) => {
  const { friendId } = req.params;
  const user = await User.findOne({ userId: req.user.userId });
  user.friends = user.friends.filter(f => f.toString() !== friendId);
  await user.save();
  res.json({ success: true });
});

// 프로필 수정 API 
router.put("/api/profile", userService.authenticate, async (req, res) => {
  try {
    const { profileImg, profileMessage } = req.body;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "사용자 없음" });

    if (profileImg) user.profileImg = profileImg;
    if (profileMessage !== undefined) user.profileMessage = profileMessage;

    await user.save();
    res.json({ success: true, message: "프로필이 수정되었습니다.", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;