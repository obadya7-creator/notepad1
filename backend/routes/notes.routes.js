import { Router } from "express";
import * as c from "../controllers/notes.controller.js";
import {
  validateCreateNote,
  validateUpdateNote,
  validateIdParam,
} from "../middleware/validate.js";

const router = Router();

// Metadata & Stats
router.get("/meta/stats", c.getStats);

// Main Notes Collection
router.get("/", c.getNotes);
router.post("/", validateCreateNote, c.createNote);

// Specific Note by ID
router.get("/:id", validateIdParam, c.getNoteById);
router.put("/:id", validateIdParam, validateUpdateNote, c.updateNote);
router.delete("/:id", validateIdParam, c.deleteNote);

// Note Flag Toggles
router.patch("/:id/pin", validateIdParam, c.toggleFlag("pinned", true));
router.patch("/:id/unpin", validateIdParam, c.toggleFlag("pinned", false));
router.patch("/:id/archive", validateIdParam, c.toggleFlag("archived", true));
router.patch("/:id/restore", validateIdParam, c.toggleFlag("archived", false));

export default router;
