import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getDbStatus } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure fallback users file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
}

const readFallbackUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeFallbackUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
};

const generateToken = (userId, username) => {
  return jwt.sign(
    { userId: String(userId), username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, authHash } = req.body;

    // Validate username
    if (!username || typeof username !== "string") {
      return res.status(400).json({ success: false, message: "Username is required" });
    }
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores",
      });
    }

    // Validate client-side pre-hash (64 hex characters)
    if (!authHash || typeof authHash !== "string" || !/^[0-9a-fA-F]{64}$/.test(authHash)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auth hash format. Expected 64-character SHA-256 string",
      });
    }

    // Generate recovery key (shown once)
    const recoveryKey = crypto.randomBytes(16).toString("hex");

    // Double-hash: server bcrypt hash of client's SHA-256 pre-hash
    const bcryptAuthHash = await bcrypt.hash(authHash, 12);
    const bcryptRecoveryHash = await bcrypt.hash(recoveryKey, 12);

    const db = getDbStatus();
    if (db.connected) {
      // Check existing user
      const existing = await User.findOne({ username: cleanUsername });
      if (existing) {
        return res.status(409).json({ success: false, message: "Username is already taken" });
      }

      const user = await User.create({
        username: cleanUsername,
        authHash: bcryptAuthHash,
        recoveryHash: bcryptRecoveryHash,
        failedLoginAttempts: 0,
        lockUntil: null,
      });

      const token = generateToken(user._id, user.username);
      return res.status(201).json({
        success: true,
        user: { id: user._id, username: user.username },
        token,
        recoveryKey, // Only returned once at registration!
      });
    }

    // Resilient Fallback store
    const users = readFallbackUsers();
    if (users.some((u) => u.username === cleanUsername)) {
      return res.status(409).json({ success: false, message: "Username is already taken" });
    }

    const newUser = {
      _id: "user-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      username: cleanUsername,
      authHash: bcryptAuthHash,
      recoveryHash: bcryptRecoveryHash,
      failedLoginAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeFallbackUsers(users);

    const token = generateToken(newUser._id, newUser.username);
    return res.status(201).json({
      success: true,
      user: { id: newUser._id, username: newUser.username },
      token,
      recoveryKey,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { username, authHash } = req.body;

    if (!username || !authHash) {
      return res.status(400).json({ success: false, message: "Username and auth hash are required" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const db = getDbStatus();

    let user;
    if (db.connected) {
      user = await User.findOne({ username: cleanUsername });
    } else {
      const users = readFallbackUsers();
      user = users.find((u) => u.username === cleanUsername);
    }

    // Generic error to prevent username enumeration
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // Check account lockout
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to 5 consecutive failed attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(authHash, user.authHash);

    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = attempts >= 5;
      const lockUntil = isNowLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

      if (db.connected) {
        await User.findByIdAndUpdate(user._id, {
          failedLoginAttempts: attempts,
          lockUntil,
        });
      } else {
        const users = readFallbackUsers();
        const idx = users.findIndex((u) => u._id === user._id);
        if (idx !== -1) {
          users[idx].failedLoginAttempts = attempts;
          users[idx].lockUntil = lockUntil ? lockUntil.toISOString() : null;
          writeFallbackUsers(users);
        }
      }

      if (isNowLocked) {
        return res.status(429).json({
          success: false,
          message: "Account locked for 15 minutes due to 5 consecutive failed attempts.",
        });
      }

      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // Successful login - reset failed attempts
    if (db.connected) {
      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    } else {
      const users = readFallbackUsers();
      const idx = users.findIndex((u) => u._id === user._id);
      if (idx !== -1) {
        users[idx].failedLoginAttempts = 0;
        users[idx].lockUntil = null;
        writeFallbackUsers(users);
      }
    }

    const token = generateToken(user._id, user.username);
    return res.json({
      success: true,
      user: { id: user._id, username: user.username },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const db = getDbStatus();
    let user;
    if (db.connected) {
      user = await User.findById(req.userId).select("-authHash -recoveryHash");
    } else {
      const users = readFallbackUsers();
      user = users.find((u) => String(u._id) === String(req.userId));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset
export const resetPassword = async (req, res, next) => {
  try {
    const { username, recoveryKey, newAuthHash } = req.body;

    if (!username || !recoveryKey || !newAuthHash) {
      return res.status(400).json({
        success: false,
        message: "Username, recovery key, and new auth hash are required",
      });
    }

    if (!/^[0-9a-fA-F]{64}$/.test(newAuthHash)) {
      return res.status(400).json({
        success: false,
        message: "Invalid new auth hash format",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const db = getDbStatus();

    let user;
    if (db.connected) {
      user = await User.findOne({ username: cleanUsername });
    } else {
      const users = readFallbackUsers();
      user = users.find((u) => u.username === cleanUsername);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or recovery key" });
    }

    // Verify recovery key
    const isRecoveryValid = await bcrypt.compare(recoveryKey.trim(), user.recoveryHash);
    if (!isRecoveryValid) {
      return res.status(401).json({ success: false, message: "Invalid username or recovery key" });
    }

    // Generate new replacement recovery key
    const newRecoveryKey = crypto.randomBytes(16).toString("hex");
    const bcryptAuthHash = await bcrypt.hash(newAuthHash, 12);
    const bcryptRecoveryHash = await bcrypt.hash(newRecoveryKey, 12);

    if (db.connected) {
      await User.findByIdAndUpdate(user._id, {
        authHash: bcryptAuthHash,
        recoveryHash: bcryptRecoveryHash,
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    } else {
      const users = readFallbackUsers();
      const idx = users.findIndex((u) => u._id === user._id);
      if (idx !== -1) {
        users[idx].authHash = bcryptAuthHash;
        users[idx].recoveryHash = bcryptRecoveryHash;
        users[idx].failedLoginAttempts = 0;
        users[idx].lockUntil = null;
        users[idx].updatedAt = new Date().toISOString();
        writeFallbackUsers(users);
      }
    }

    const token = generateToken(user._id, user.username);
    return res.json({
      success: true,
      message: "Password reset successfully. Save your new recovery key.",
      user: { id: user._id, username: user.username },
      token,
      newRecoveryKey,
    });
  } catch (err) {
    next(err);
  }
};
