const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    phone: { type: String, default: "", trim: true },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      weatherAlerts: { type: Boolean, default: true },
      hiddenGemsAlerts: { type: Boolean, default: true },
      nearbyHotelsAlerts: { type: Boolean, default: true }
    },
    preferences: {
      interests: [String],
      travelStyle: { type: String, default: "budget" }
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.matchPassword = async function matchPassword(input) {
  return bcrypt.compare(input, this.password);
};

module.exports = mongoose.model("User", userSchema);
