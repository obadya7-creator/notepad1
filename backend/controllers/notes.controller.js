import Note from "../models/Note.js";
import { getDbStatus } from "../config/db.js";
import { escapeRegex } from "../middleware/validate.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "notes.json");

// Ensure data directory and file exist for fallback persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
}

const readFallbackNotes = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeFallbackNotes = (notes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf8");
};

// GET /api/notes?search=&category=&label=&sort=latest|oldest|title&archived=false
export const getNotes = async (req, res, next) => {
  try {
    const { search, category, label, sort = "latest", archived = "false", pinned } = req.query;
    const isArchived = archived === "true";
    const userId = req.userId;

    const db = getDbStatus();
    if (db.connected) {
      const filter = { owner: userId, archived: isArchived };
      if (category && category !== "All") {
        filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
      }
      if (label) {
        filter.labels = label.toLowerCase();
      }
      if (pinned !== undefined) {
        filter.pinned = pinned === "true";
      }
      if (search && search.trim()) {
        const safeRegex = escapeRegex(search.trim());
        filter.$or = [
          { title: { $regex: safeRegex, $options: "i" } },
          { content: { $regex: safeRegex, $options: "i" } },
        ];
      }

      const sortMap = { latest: "-updatedAt", oldest: "updatedAt", title: "title" };
      const notes = await Note.find(filter).sort([
        ["pinned", -1],
        [sortMap[sort] || "-updatedAt"],
      ]);
      return res.json(notes);
    }

    // Resilient Fallback store scoped to user
    let notes = readFallbackNotes();
    notes = notes.filter((n) => String(n.owner) === String(userId) && Boolean(n.archived) === isArchived);

    if (category && category !== "All") {
      notes = notes.filter((n) => n.category?.toLowerCase() === category.toLowerCase());
    }
    if (label) {
      notes = notes.filter((n) => n.labels?.some((l) => l.toLowerCase() === label.toLowerCase()));
    }
    if (pinned !== undefined) {
      notes = notes.filter((n) => Boolean(n.pinned) === (pinned === "true"));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      notes = notes.filter(
        (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
      );
    }

    notes.sort((a, b) => {
      // Pinned notes always float first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    return res.json(notes);
  } catch (e) {
    next(e);
  }
};

// GET /api/notes/meta/stats
export const getStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const db = getDbStatus();

    if (db.connected) {
      const all = await Note.find({ owner: userId });
      const active = all.filter((n) => !n.archived);
      const pinned = active.filter((n) => n.pinned).length;
      const archived = all.filter((n) => n.archived).length;
      const categories = [...new Set(all.map((n) => n.category).filter(Boolean))];
      const labels = [...new Set(all.flatMap((n) => n.labels || []).filter(Boolean))];

      return res.json({
        total: all.length,
        active: active.length,
        pinned,
        archived,
        categories,
        labels,
        storageMode: "mongodb",
      });
    }

    const all = readFallbackNotes().filter((n) => String(n.owner) === String(userId));
    const active = all.filter((n) => !n.archived);
    const pinned = active.filter((n) => n.pinned).length;
    const archived = all.filter((n) => n.archived).length;
    const categories = [...new Set(all.map((n) => n.category).filter(Boolean))];
    const labels = [...new Set(all.flatMap((n) => n.labels || []).filter(Boolean))];

    return res.json({
      total: all.length,
      active: active.length,
      pinned,
      archived,
      categories,
      labels,
      storageMode: "local-file",
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/notes
export const createNote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, content, category = "General", labels = [], color = "#ffffff", pinned = false } = req.body;

    const db = getDbStatus();
    if (db.connected) {
      const note = await Note.create({
        owner: userId,
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || "General",
        labels: Array.isArray(labels) ? labels.map((l) => l.trim().toLowerCase()).filter(Boolean) : [],
        color: color || "#ffffff",
        pinned: Boolean(pinned),
        archived: false,
      });
      return res.status(201).json(note);
    }

    const notes = readFallbackNotes();
    const newNote = {
      _id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      owner: String(userId),
      title: title.trim(),
      content: content.trim(),
      category: category.trim() || "General",
      labels: Array.isArray(labels) ? labels.map((l) => l.trim().toLowerCase()).filter(Boolean) : [],
      color: color || "#ffffff",
      pinned: Boolean(pinned),
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    writeFallbackNotes(notes);
    return res.status(201).json(newNote);
  } catch (e) {
    next(e);
  }
};

// GET /api/notes/:id
export const getNoteById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const db = getDbStatus();

    if (db.connected) {
      const note = await Note.findOne({ _id: req.params.id, owner: userId });
      if (!note) {
        return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
      }
      return res.json(note);
    }

    const notes = readFallbackNotes();
    const note = notes.find((n) => n._id === req.params.id && String(n.owner) === String(userId));
    if (!note) {
      return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
    }
    return res.json(note);
  } catch (e) {
    next(e);
  }
};

// PUT /api/notes/:id
export const updateNote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, content, category, labels, color, pinned, archived } = req.body;

    const db = getDbStatus();
    if (db.connected) {
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (category !== undefined) updateData.category = category.trim() || "General";
      if (labels !== undefined) {
        updateData.labels = Array.isArray(labels) ? labels.map((l) => l.trim().toLowerCase()).filter(Boolean) : [];
      }
      if (color !== undefined) updateData.color = color;
      if (pinned !== undefined) updateData.pinned = Boolean(pinned);
      if (archived !== undefined) updateData.archived = Boolean(archived);

      const note = await Note.findOneAndUpdate({ _id: req.params.id, owner: userId }, updateData, {
        new: true,
        runValidators: true,
      });
      if (!note) {
        return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
      }
      return res.json(note);
    }

    const notes = readFallbackNotes();
    const index = notes.findIndex((n) => n._id === req.params.id && String(n.owner) === String(userId));
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
    }

    notes[index] = {
      ...notes[index],
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content: content.trim() }),
      ...(category !== undefined && { category: category.trim() || "General" }),
      ...(labels !== undefined && {
        labels: Array.isArray(labels) ? labels.map((l) => l.trim().toLowerCase()).filter(Boolean) : [],
      }),
      ...(color !== undefined && { color }),
      ...(pinned !== undefined && { pinned: Boolean(pinned) }),
      ...(archived !== undefined && { archived: Boolean(archived) }),
      updatedAt: new Date().toISOString(),
    };
    writeFallbackNotes(notes);
    return res.json(notes[index]);
  } catch (e) {
    next(e);
  }
};

// DELETE /api/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const db = getDbStatus();

    if (db.connected) {
      const note = await Note.findOneAndDelete({ _id: req.params.id, owner: userId });
      if (!note) {
        return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
      }
      return res.json({ success: true, message: "Note deleted successfully", id: req.params.id });
    }

    const notes = readFallbackNotes();
    const index = notes.findIndex((n) => n._id === req.params.id && String(n.owner) === String(userId));
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
    }

    notes.splice(index, 1);
    writeFallbackNotes(notes);
    return res.json({ success: true, message: "Note deleted successfully", id: req.params.id });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/notes/:id/pin | /unpin | /archive | /restore
export const toggleFlag = (field, value) => async (req, res, next) => {
  try {
    const userId = req.userId;
    const db = getDbStatus();

    if (db.connected) {
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, owner: userId },
        { [field]: value },
        { new: true }
      );
      if (!note) {
        return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
      }
      return res.json(note);
    }

    const notes = readFallbackNotes();
    const index = notes.findIndex((n) => n._id === req.params.id && String(n.owner) === String(userId));
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Note not found with id: ${req.params.id}` });
    }

    notes[index][field] = value;
    notes[index].updatedAt = new Date().toISOString();
    writeFallbackNotes(notes);
    return res.json(notes[index]);
  } catch (e) {
    next(e);
  }
};
