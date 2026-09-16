const allowedOrigins = (process.env.FRONTEND_ORIGINS ||
  "https://chat-app-psi-orcin.vercel.app,http://localhost:3000,http://127.0.0.1:3000")
  .split(",").map((origin) => origin.trim());

// Protect cookie-changing endpoints, including login, from cross-site requests.
// The custom header forces browser preflight; origins must also be allowlisted.
function authRequestGuard(req, res, next) {
  if (req.method === "POST") {
    const origin = req.get("Origin");
    if ((origin && !allowedOrigins.includes(origin)) ||
        req.get("X-Requested-With") !== "ChatApp") {
      return res.status(403).json({ message: "Untrusted authentication request." });
    }
  }
  next();
}
module.exports = { allowedOrigins, authRequestGuard };
