const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/auth");
const { sendPasswordResetEmail } = require("../utils/emailService");

const router = express.Router();

function tokenFor(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function normalizeIndianPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits;
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
    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email");
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      notificationSettings: user.notificationSettings,
      token: tokenFor(user._id)
    });
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
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      notificationSettings: user.notificationSettings,
      token: tokenFor(user._id)
    });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid registered email");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    const resetToken = jwt.sign(
      { email: user.email, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.RESET_TOKEN_EXPIRES_IN || "15m" }
    );
    const frontendBase = String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    const resetLink = `${frontendBase}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetLink
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (e) {
    if (e?.message === "Gmail not configured in .env") {
      res.status(500);
    }
    next(e);
  }
});

router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const token = String(req.params.token || "").trim();
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!token) {
      res.status(400);
      throw new Error("Invalid reset token");
    }
    if (!newPassword || !confirmPassword) {
      res.status(400);
      throw new Error("New password and confirm password are required");
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error("Passwords do not match");
    }

    let payload = null;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      res.status(400);
      throw new Error("Reset link is invalid or expired");
    }

    if (!payload?.email || payload.type !== "password_reset") {
      res.status(400);
      throw new Error("Reset link is invalid or expired");
    }

    const user = await User.findOne({ email: String(payload.email).toLowerCase() });

    if (!user) {
      res.status(400);
      throw new Error("Reset link is invalid or expired");
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
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

router.put("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const nextName = String(req.body.name || "").trim();
    const nextEmail = String(req.body.email || "").trim().toLowerCase();
    const nextPhone = normalizeIndianPhone(req.body.phone);
    if (!nextName) {
      res.status(400);
      throw new Error("Name is required");
    }
    if (!nextEmail || !isValidEmail(nextEmail)) {
      res.status(400);
      throw new Error("Valid email is required");
    }
    if (nextPhone && nextPhone.length !== 10) {
      res.status(400);
      throw new Error("Phone number must be exactly 10 digits");
    }

    if (nextEmail !== user.email) {
      const exists = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (exists) {
        res.status(400);
        throw new Error("Email already in use");
      }
    }

    user.name = nextName;
    user.email = nextEmail;
    user.phone = nextPhone;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      notificationSettings: user.notificationSettings
    });
  } catch (e) {
    next(e);
  }
});

router.put("/password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current and new password are required");
    }
    if (String(newPassword).length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }
    if (!(await user.matchPassword(String(currentPassword)))) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    user.password = String(newPassword);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
});

router.put("/settings", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const incoming = req.body || {};
    user.notificationSettings = {
      emailAlerts: Boolean(incoming.emailAlerts),
      weatherAlerts: Boolean(incoming.weatherAlerts),
      hiddenGemsAlerts: Boolean(incoming.hiddenGemsAlerts),
      nearbyHotelsAlerts: Boolean(incoming.nearbyHotelsAlerts)
    };
    await user.save();

    res.json({ notificationSettings: user.notificationSettings });
  } catch (e) {
    next(e);
  }
});

router.delete("/account", protect, async (req, res, next) => {
  try {
    await Trip.deleteMany({ user: req.user.id });
    const deleted = await User.findByIdAndDelete(req.user.id);
    if (!deleted) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ message: "Account deleted successfully" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
