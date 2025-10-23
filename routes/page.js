const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const path = require("path");

// 모든 페이지 접근 전 인증 미들웨어 적용
router.get("/9_마라탕공주들_chat_detail.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_chat_detail.html"));
});

/** router.get("/9_마라탕공주들_chat_list.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_chat_list.html"));
}); **/

router.get("/9_마라탕공주들_checklist.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_checklist.html"));
});

router.get("/9_마라탕공주들_history.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_history.html"));
});

router.get("/9_마라탕공주들_index.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_index.html"));
});

router.get("/9_마라탕공주들_setting.html", userService.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/9_마라탕공주들_setting.html"));
});