const express = require("express");
const { isGmailConfigured } = require("../utils/emailService");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/email-status", protect, (req, res) => {
  res.json({ gmailConfigured: isGmailConfigured() });
});

module.exports = router;
