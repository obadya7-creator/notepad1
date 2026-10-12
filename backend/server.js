import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import notesRoutes from "./routes/notes.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const db = getDbStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: db.connected ? "mongodb" : "local-file-fallback",
    dbDetails: db,
  });
});

// Notes API Routes
app.use("/api/notes", notesRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Notes API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Notes Endpoint: http://localhost:${PORT}/api/notes`);
  await connectDB();
});

export default app;
