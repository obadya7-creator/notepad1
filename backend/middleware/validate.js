import mongoose from "mongoose";
import { getDbStatus } from "../config/db.js";

// Helper to escape regex special characters in search queries
export const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Middleware: Validate ID parameter
export const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.trim()) {
    return res.status(400).json({
      success: false,
      message: "Note ID parameter is required",
    });
  }

  const db = getDbStatus();
  // If MongoDB is actively connected, enforce valid ObjectId format
  if (db.connected && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid Note ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`,
    });
  }

  next();
};

// Middleware: Validate Create Note payload
export const validateCreateNote = (req, res, next) => {
  const { title, content, category, labels, color, pinned } = req.body;
  const errors = [];

  // Validate Title
  if (title === undefined || title === null || typeof title !== "string" || !title.trim()) {
    errors.push("Title is required and must be a non-empty string");
  } else if (title.trim().length > 120) {
    errors.push("Title cannot exceed 120 characters");
  }

  // Validate Content
  if (content === undefined || content === null || typeof content !== "string" || !content.trim()) {
    errors.push("Content is required and must be a non-empty string");
  } else if (content.trim().length > 10000) {
    errors.push("Content cannot exceed 10,000 characters");
  }

  // Validate Category (optional)
  if (category !== undefined && typeof category !== "string") {
    errors.push("Category must be a string");
  } else if (category && category.trim().length > 50) {
    errors.push("Category cannot exceed 50 characters");
  }

  // Validate Labels (optional)
  if (labels !== undefined && !Array.isArray(labels)) {
    errors.push("Labels must be an array of strings");
  } else if (Array.isArray(labels)) {
    for (const label of labels) {
      if (typeof label !== "string") {
        errors.push("Each label item must be a string");
        break;
      }
    }
  }

  // Validate Color (optional)
  if (color !== undefined) {
    if (typeof color !== "string" || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
      errors.push("Color must be a valid hex color string (e.g. #ffffff or #f59e0b)");
    }
  }

  // Validate Pinned (optional)
  if (pinned !== undefined && typeof pinned !== "boolean") {
    errors.push("Pinned flag must be a boolean");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join("; "),
      errors,
    });
  }

  next();
};

// Middleware: Validate Update Note payload
export const validateUpdateNote = (req, res, next) => {
  const { title, content, category, labels, color, pinned, archived } = req.body;
  const errors = [];

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body cannot be empty for an update",
    });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      errors.push("Title cannot be empty");
    } else if (title.trim().length > 120) {
      errors.push("Title cannot exceed 120 characters");
    }
  }

  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      errors.push("Content cannot be empty");
    } else if (content.trim().length > 10000) {
      errors.push("Content cannot exceed 10,000 characters");
    }
  }

  if (category !== undefined && typeof category !== "string") {
    errors.push("Category must be a string");
  }

  if (labels !== undefined && !Array.isArray(labels)) {
    errors.push("Labels must be an array of strings");
  }

  if (color !== undefined) {
    if (typeof color !== "string" || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
      errors.push("Color must be a valid hex color string (e.g. #ffffff)");
    }
  }

  if (pinned !== undefined && typeof pinned !== "boolean") {
    errors.push("Pinned flag must be a boolean");
  }

  if (archived !== undefined && typeof archived !== "boolean") {
    errors.push("Archived flag must be a boolean");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join("; "),
      errors,
    });
  }

  next();
};
