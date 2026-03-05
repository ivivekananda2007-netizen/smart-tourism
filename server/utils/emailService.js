const nodemailer = require("nodemailer");

function getNormalizedGmailUser() {
  return String(process.env.GMAIL_USER || "").trim();
}

function getNormalizedGmailAppPassword() {
  return String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "").trim();
}

function isGmailConfigured() {
  return Boolean(getNormalizedGmailUser() && getNormalizedGmailAppPassword());
}

function getTransporter() {
  if (!isGmailConfigured()) {
    throw new Error("Gmail not configured in .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: getNormalizedGmailUser(),
      pass: getNormalizedGmailAppPassword()
    }
  });
}

async function sendPasswordResetEmail({ email, name, resetLink }) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Trip Genius" <${getNormalizedGmailUser()}>`,
    to: email,
    subject: "Password Reset - Trip Genius",
    html: `
      <h3>Password Reset Request</h3>
      <p>Hi ${name || "Traveler"},</p>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in ${process.env.RESET_TOKEN_EXPIRES_IN || "15m"}.</p>
    `
  });
}

module.exports = {
  isGmailConfigured,
  sendPasswordResetEmail
};
