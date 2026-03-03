const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function tokenFor(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(400);
      throw new Error("Email already registered");
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: tokenFor(user._id) });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    res.json({ _id: user._id, name: user.name, email: user.email, token: tokenFor(user._id) });
  } catch (e) {
    next(e);
  }
});

router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
