const User = require("../models/User");

async function login({ userId, password }) {
  const user = await User.findOne({ userId, password });
  if (!user) throw new Error("로그인 실패");
  return { userId: user.userId, name: user.name };
}

async function getFriends(userId) {
  return await User.find({ userId: { $ne: userId } }); // 자기 자신 제외
}

module.exports = { login, getFriends };