const router = require("express").Router();
const { register, login, refresh, logout, me, changePassword } = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const { protect, authorize } = require("../middleware/auth");

router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
router.put("/change-password", protect, changePassword);
router.post("/register", protect, authorize("SUPER_ADMIN", "HR"), register);

module.exports = router;