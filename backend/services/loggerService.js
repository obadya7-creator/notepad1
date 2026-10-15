import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import UserLog from "../models/UserLog.js";
import { getDbStatus } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const LOGS_FILE = path.join(DATA_DIR, "user_logs.json");

// Ensure fallback logs directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf8");
}

const appendFallbackLog = (entry) => {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, "utf8");
      logs = JSON.parse(data || "[]");
    }
    logs.push(entry);
    // Keep last 1000 logs in local fallback to prevent excessive file size
    if (logs.length > 1000) {
      logs = logs.slice(logs.length - 1000);
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("⚠️ Failed to write to fallback logs file:", err.message);
  }
};

/**
 * Helper to produce clean human-readable action names for logs
 */
export const resolveActionName = (method, url = "") => {
  if (url.includes("/api/auth/register")) return "USER_REGISTER";
  if (url.includes("/api/auth/login")) return "USER_LOGIN";
  if (url.includes("/api/auth/me")) return "USER_SESSION_CHECK";
  if (url.includes("/api/auth/reset")) return "USER_PASSWORD_RESET";
  if (url.includes("/api/notes/meta/stats")) return "NOTES_STATS_VIEW";
  if (url.includes("/pin")) return "NOTE_PIN_TOGGLE";
  if (url.includes("/unpin")) return "NOTE_UNPIN";
  if (url.includes("/archive")) return "NOTE_ARCHIVE_TOGGLE";
  if (url.includes("/restore")) return "NOTE_RESTORE";
  if (url.includes("/api/notes")) {
    if (method === "GET") return "NOTES_FETCH";
    if (method === "POST") return "NOTE_CREATE";
    if (method === "PUT") return "NOTE_UPDATE";
    if (method === "DELETE") return "NOTE_DELETE";
    if (method === "PATCH") return "NOTE_PATCH";
  }
  return `${method} ${url}`;
};

/**
 * Record user log directly into MongoDB (visible in MongoDB Compass under 'user_logs')
 * with resilient fallback to data/user_logs.json
 */
export const recordUserLog = async ({
  userId = null,
  username = "anonymous",
  action,
  status = "INFO",
  req = null,
  endpoint = "",
  method = "",
  statusCode = null,
  durationMs = null,
  details = {},
}) => {
  try {
    const ip = req
      ? req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress || ""
      : "";
    const userAgent = req ? req.headers["user-agent"] || "" : "";
    const reqEndpoint = endpoint || (req ? req.originalUrl || req.url : "");
    const reqMethod = method || (req ? req.method : "");
    const resolvedUser =
      username && username !== "anonymous"
        ? username
        : req?.username || req?.body?.username || "anonymous";
    const resolvedUserId = userId || req?.userId || null;

    const logEntry = {
      userId: resolvedUserId,
      username: resolvedUser,
      action,
      status,
      ip,
      userAgent,
      endpoint: reqEndpoint,
      method: reqMethod,
      statusCode,
      durationMs,
      details,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = getDbStatus();
    if (db.connected) {
      await UserLog.create(logEntry);
    } else {
      appendFallbackLog({
        _id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        ...logEntry,
      });
    }
  } catch (err) {
    // Non-blocking logger to ensure request execution is never interrupted
    console.error("⚠️ Failed to record user log:", err.message);
  }
};
