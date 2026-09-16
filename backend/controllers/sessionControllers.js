const asyncHandler = require("express-async-handler");
const RefreshSession = require("../models/refreshSessionModel");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const { readToken, hashToken, revokeSession, clearSessionCookie } = require("../config/refreshSession");

const refresh = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");
  const token = readToken(req);
  // Check expiry explicitly: MongoDB TTL cleanup is asynchronous.
  const session = token && await RefreshSession.findOne({
    tokenHash: hashToken(token), expiresAt: { $gt: new Date() },
  });
  const user = session && await User.findById(session.user).select("-password");
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ code: "SESSION_EXPIRED", message: "Please log in again." });
  }
  // Fixed expiry: refreshing does not extend the 90-day login session.
  res.json({ token: generateToken(user._id) });
});

const logout = asyncHandler(async (req, res) => {
  await revokeSession(req);
  clearSessionCookie(res);
  res.set("Cache-Control", "no-store");
  res.sendStatus(204);
});

module.exports = { refresh, logout };
