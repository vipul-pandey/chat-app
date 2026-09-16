const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const { refresh, logout } = require("../controllers/sessionControllers");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.put("/:id", protect, updateUser);

module.exports = router;
