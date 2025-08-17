const express = require("express");
const { fetchAIChatRoutes } = require("../controllers/aiChatControllers");
// const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.route("/").post(fetchAIChatRoutes);

module.exports = router;