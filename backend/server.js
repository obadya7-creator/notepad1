import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notes.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { recordUserLog, resolveActionName } from "./services/loggerService.js";

dotenv.config();

// Verify JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";
const SERVER_URL = process.env.SERVER_URL || process.env.BASE_URL || `http://${HOST}:${PORT}`;
const HEALTH_ENDPOINT = process.env.HEALTH_ENDPOINT || "/api/health";
const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT || "/api/auth";
const NOTES_ENDPOINT = process.env.NOTES_ENDPOINT || "/api/notes";

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Let frontend dev server manage CSP in dev
    crossOriginEmbedderPolicy: false,
  })
);

// Enable CORS with JSON body parser (limited to 1MB)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

// Request logging & saving to MongoDB Compass (user_logs collection)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);

    // Record user activity in MongoDB (skip health checks to keep logs focused)
    if (!req.originalUrl.includes("/health")) {
      const action = resolveActionName(req.method, req.originalUrl);
      const status =
        res.statusCode >= 200 && res.statusCode < 400
          ? "SUCCESS"
          : res.statusCode === 429
          ? "WARNING"
          : res.statusCode >= 400 && res.statusCode < 500
          ? "FAILED"
          : "ERROR";

      recordUserLog({
        userId: req.userId || null,
        username: req.username || req.body?.username || "anonymous",
        action,
        status,
        req,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    }
  });
  next();
});

// Health check endpoint (public)
app.get(HEALTH_ENDPOINT, (req, res) => {
  const db = getDbStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: db.connected ? "mongodb" : "local-file-fallback",
    dbDetails: db,
  });
});

// Authentication routes
app.use(AUTH_ENDPOINT, authRoutes);

// Notes API Routes (protected)
app.use(NOTES_ENDPOINT, notesRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Notes API Server running at ${SERVER_URL}`);
  console.log(`📡 Health Check: ${SERVER_URL}${HEALTH_ENDPOINT}`);
  console.log(`🔐 Auth Endpoints: ${SERVER_URL}${AUTH_ENDPOINT}`);
  console.log(`📝 Notes Endpoint: ${SERVER_URL}${NOTES_ENDPOINT}`);
  await connectDB();
});

export default app;
