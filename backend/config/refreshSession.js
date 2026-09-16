const crypto = require("crypto");
const RefreshSession = require("../models/refreshSessionModel");

const COOKIE_NAME = "chat_refresh";
const SESSION_MS = 90 * 24 * 60 * 60 * 1000;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || Boolean(process.env.RENDER),
  sameSite: "strict",
  path: "/api/user",
});

function readToken(req) {
  const cookie = (req.headers.cookie || "").split(";")
    .map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie ? cookie.slice(COOKIE_NAME.length + 1) : "";
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

async function revokeSession(req) {
  const token = readToken(req);
  if (token) await RefreshSession.deleteOne({ tokenHash: hashToken(token) });
}

async function createSession(req, res, user) {
  await revokeSession(req);
  const token = crypto.randomBytes(32).toString("hex");
  await RefreshSession.create({
    tokenHash: hashToken(token), user: user._id,
    expiresAt: new Date(Date.now() + SESSION_MS),
  });
  res.set("Cache-Control", "no-store");
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SESSION_MS });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = { readToken, hashToken, createSession, revokeSession, clearSessionCookie };
