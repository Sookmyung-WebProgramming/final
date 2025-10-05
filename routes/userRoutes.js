const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

router.post("/login", async (req, res) => {
  try {
    const result = await userService.login(req.body);
    res.json({ isSuccess: true, result });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

router.get("/friends", async (req, res) => {
  try {
    const result = await userService.getFriends(req.query.userId);
    res.json({ isSuccess: true, result });
  } catch (err) {
    res.json({ isSuccess: false, message: err.message });
  }
});

module.exports = router;