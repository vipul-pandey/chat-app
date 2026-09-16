const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ code: "AUTH_REQUIRED", message: "Please log in." });
  }
  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    return res.status(401).json({
      code: error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
      message: "Your login token is expired or invalid.",
    });
  }
  // Database failures must remain server errors, not trigger logout/refresh.
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
    return res.status(401).json({ code: "USER_NOT_FOUND", message: "Please log in again." });
  }
  next();
});

module.exports = { protect };
