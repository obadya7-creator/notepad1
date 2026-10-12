import { Router } from "express";
import * as c from "../controllers/notes.controller.js";

const router = Router();

router.get("/meta/stats", c.getStats);
router.get("/", c.getNotes);
router.post("/", c.createNote);

router.get("/:id", c.getNoteById);
router.put("/:id", c.updateNote);
router.delete("/:id", c.deleteNote);

router.patch("/:id/pin", c.toggleFlag("pinned", true));
router.patch("/:id/unpin", c.toggleFlag("pinned", false));
router.patch("/:id/archive", c.toggleFlag("archived", true));
router.patch("/:id/restore", c.toggleFlag("archived", false));

export default router;
