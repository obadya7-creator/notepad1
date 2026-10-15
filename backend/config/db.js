import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Note from "../models/Note.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

export const syncLocalDataToMongo = async () => {
  try {
    const usersFile = path.join(DATA_DIR, "users.json");
    const notesFile = path.join(DATA_DIR, "notes.json");

    if (!fs.existsSync(usersFile)) return;

    let localUsers = [];
    try {
      const rawUsers = fs.readFileSync(usersFile, "utf8");
      localUsers = rawUsers.trim() ? JSON.parse(rawUsers) : [];
    } catch {
      localUsers = [];
    }

    const idMapping = {}; // local user ID -> MongoDB ObjectId

    for (const u of localUsers) {
      if (!u.username) continue;
      let mongoUser = await User.findOne({ username: u.username.toLowerCase() });
      if (!mongoUser) {
        mongoUser = await User.create({
          username: u.username.toLowerCase(),
          authHash: u.authHash,
          recoveryHash: u.recoveryHash,
          failedLoginAttempts: u.failedLoginAttempts || 0,
          lockUntil: u.lockUntil || null,
          createdAt: u.createdAt || new Date(),
          updatedAt: u.updatedAt || new Date(),
        });
        console.log(`👤 Stored user "${u.username}" into MongoDB Atlas/Compass (ID: ${mongoUser._id})`);
      }
      idMapping[u._id] = mongoUser._id;
    }

    if (fs.existsSync(notesFile)) {
      let localNotes = [];
      try {
        const rawNotes = fs.readFileSync(notesFile, "utf8");
        localNotes = rawNotes.trim() ? JSON.parse(rawNotes) : [];
      } catch {
        localNotes = [];
      }

      for (const n of localNotes) {
        if (!n.title && !n.content) continue;
        const mappedOwnerId = idMapping[n.owner];
        if (!mappedOwnerId) continue;

        const existingNote = await Note.findOne({
          owner: mappedOwnerId,
          title: n.title,
        });

        if (!existingNote) {
          await Note.create({
            owner: mappedOwnerId,
            title: n.title || "Untitled",
            content: n.content || "",
            category: n.category || "General",
            labels: n.labels || [],
            color: n.color || "#ffffff",
            pinned: !!n.pinned,
            archived: !!n.archived,
            createdAt: n.createdAt || new Date(),
            updatedAt: n.updatedAt || new Date(),
          });
          console.log(`📝 Stored note "${n.title}" into MongoDB for owner ${mappedOwnerId}`);
        }
      }
    }
  } catch (err) {
    console.error("⚠️ Data sync notice:", err.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("ℹ️  No MONGO_URI provided in .env. Running in resilient persistent storage mode.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    await syncLocalDataToMongo();
    return true;
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    console.warn(`⚠️  MongoDB connection note: ${err.message}`);
    console.warn("ℹ️  Backend operating in persistent storage mode (data/notes.json). All notes persist!");
    return false;
  }
};

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  host: mongoose.connection.readyState === 1 ? mongoose.connection.host : null,
  name: mongoose.connection.readyState === 1 ? mongoose.connection.name : null,
});
