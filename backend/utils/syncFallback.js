import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Note from "../models/Note.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

/**
 * Automatically sync local fallback users and notes into MongoDB Atlas upon connection
 */
export const syncFallbackToDb = async () => {
  try {
    const usersFile = path.join(DATA_DIR, "users.json");
    const notesFile = path.join(DATA_DIR, "notes.json");

    const userMap = {}; // old fallback ID -> new Mongo ObjectId

    if (fs.existsSync(usersFile)) {
      const rawUsers = fs.readFileSync(usersFile, "utf8").trim();
      const fallbackUsers = rawUsers ? JSON.parse(rawUsers) : [];
      for (const fu of fallbackUsers) {
        if (!fu.username) continue;
        const cleanUser = fu.username.toLowerCase();
        let dbUser = await User.findOne({ username: cleanUser });
        if (!dbUser) {
          dbUser = await User.create({
            username: cleanUser,
            authHash: fu.authHash,
            recoveryHash: fu.recoveryHash,
            failedLoginAttempts: fu.failedLoginAttempts || 0,
            lockUntil: fu.lockUntil || null,
          });
          console.log(`📥 Synced user '${cleanUser}' into MongoDB Atlas!`);
        }
        if (fu._id && dbUser._id) {
          userMap[fu._id] = dbUser._id;
        }
      }
    }

    if (fs.existsSync(notesFile)) {
      const rawNotes = fs.readFileSync(notesFile, "utf8").trim();
      const fallbackNotes = rawNotes ? JSON.parse(rawNotes) : [];
      for (const fn of fallbackNotes) {
        if (!fn.title || !fn.content) continue;
        const targetOwner = userMap[fn.owner] || fn.owner;
        if (targetOwner && String(targetOwner).length === 24) {
          const exists = await Note.findOne({ owner: targetOwner, title: fn.title });
          if (!exists) {
            await Note.create({
              owner: targetOwner,
              title: fn.title,
              content: fn.content,
              category: fn.category || "General",
              labels: fn.labels || [],
              color: fn.color || "#ffffff",
              pinned: !!fn.pinned,
              archived: !!fn.archived,
            });
            console.log(`📝 Synced note '${fn.title}' into MongoDB Atlas!`);
          }
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Note during fallback sync to MongoDB:", err.message);
  }
};
