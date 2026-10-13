import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notes.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Verify JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

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

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint (public)
app.get("/api/health", (req, res) => {
  const db = getDbStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: db.connected ? "mongodb" : "local-file-fallback",
    dbDetails: db,
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Notes API Routes (protected)
app.use("/api/notes", notesRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Notes API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Notes Endpoint: http://localhost:${PORT}/api/notes`);
  await connectDB();
});

export default app;
