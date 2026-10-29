const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  signAccessToken, signRefreshToken, hashToken, refreshCookieOptions,
} = require("../utils/tokens");

// Dono tokens issue karne ka common helper
const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await User.updateOne({ _id: user._id }, { refreshTokenHash: hashToken(refreshToken) });
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  return accessToken;
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const code = req.body.code || email.split("@")[0];

    const exists = await User.findOne({ $or: [{ email }, { code: code.toUpperCase() }] });
    if (exists) return res.status(409).json({ success: false, message: "User already exists" });

    const user = await User.create({ code, fullName, email, password });
    res.status(201).json({ success: true, data: { id: user._id, code: user.code, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Identifier aur password required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { code: identifier.toUpperCase() }],
    }).select("+password");

    if (!user || !(await user.comparePassword(password)) || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = await issueTokens(user, res);
    res.json({
      success: true,
      accessToken,
      mustChangePassword: user.mustChangePassword,
      user: { id: user._id, code: user.code, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "Refresh token missing" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id).select("+refreshTokenHash");
    if (!user || !user.isActive || user.refreshTokenHash !== hashToken(token)) {
      // Purana/reuse hua token: session khatam
      if (user) await User.updateOne({ _id: user._id }, { refreshTokenHash: null });
      return res.status(401).json({ success: false, message: "Refresh token revoked" });
    }

    const accessToken = await issueTokens(user, res); // rotation: naya refresh token
    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.updateOne({ _id: decoded.id }, { refreshTokenHash: null });
      } catch { /* expired token ho to bhi cookie clear karni hai */ }
    }
    res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: undefined });
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password galat hai" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "Naya password purane se alag hona chahiye" });
    }

    user.password = newPassword; // pre-save hook hash karega
    user.mustChangePassword = false;
    user.refreshTokenHash = null; // baqi sab sessions logout
    await user.save();

    res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: undefined });
    res.json({ success: true, message: "Password changed. Dobara login karo." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};