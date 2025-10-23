const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "dfsdfdddwddfdfr3"; 

// 로그인
exports.login = async (userId, password) => {
  const user = await User.findOne({ userId });
  if (!user) return { success: false, message: "존재하지 않는 아이디입니다." };
  if (user.password !== password) return { success: false, message: "비밀번호가 일치하지 않습니다." };
  return user;
};

// 회원가입
exports.register = async (userId, password, name) => {
  const existing = await User.findOne({ userId });
  if (existing) return { success: false, message: "이미 존재하는 아이디입니다." };
  const newUser = new User({ userId, password, name });
  await newUser.save();
  return newUser;
};

// 인증 미들웨어
exports.authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "로그인 필요" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "토큰 만료 또는 유효하지 않음" });
  }
};

// JWT 생성 헬퍼
exports.generateToken = (user) => {
  return jwt.sign({ userId: user.userId, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
};