import React, { useState, useEffect } from "react";
import { X, Loader2, Pin, Tag, Folder, Palette } from "lucide-react";

const PRESET_COLORS = [
  { label: "Default", value: "#ffffff" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Teal", value: "#14b8a6" },
];

const PRESET_CATEGORIES = ["General", "Work", "Personal", "Ideas", "Study", "Tasks"];

export default function NoteEditorModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [category, setCategory] = useState(note?.category || "General");
  const [customCategory, setCustomCategory] = useState("");
  const [labels, setLabels] = useState(note?.labels || []);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState(note?.color || "#ffffff");
  const [pinned, setPinned] = useState(Boolean(note?.pinned));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length > 120) {
      newErrors.title = "Title cannot exceed 120 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.trim().length > 10000) {
      newErrors.content = "Content cannot exceed 10,000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (trimmed && !labels.includes(trimmed)) {
        setLabels([...labels, trimmed]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setLabels(labels.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalCategory =
      category === "Custom" ? customCategory.trim() || "General" : category;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: finalCategory,
      labels,
      color,
      pinned,
    };

    const success = await onSave(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {note ? "Edit Note" : "Create New Note"}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <div className="form-label">
                <span>Title *</span>
                <span style={{ fontSize: "0.75rem", color: title.length > 120 ? "var(--danger)" : "var(--text-light)" }}>
                  {title.length}/120
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Give your note a title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Category and Color Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Folder size={14} /> Category
                  </span>
                </label>
                <select
                  className="form-select"
                  value={PRESET_CATEGORIES.includes(category) ? category : "Custom"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    if (val !== "Custom") setCustomCategory("");
                  }}
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Custom">+ Custom Category</option>
                </select>

                {category === "Custom" && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter custom category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ marginTop: "0.4rem" }}
                  />
                )}
              </div>

              {/* Pin Note Toggle */}
              <div className="form-group">
                <label className="form-label">Priority</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-primary)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                  />
                  <Pin size={15} style={{ color: pinned ? "#f59e0b" : "var(--text-light)" }} />
                  <span>Pin to top of notes</span>
                </label>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Palette size={14} /> Color Accent
                </span>
              </label>
              <div className="color-picker">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-option ${color === c.value ? "selected" : ""}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Labels Input */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Tag size={14} /> Labels / Tags
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                  Press Enter or comma to add
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. project, quick-idea, urgent"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {labels.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
                  {labels.map((lbl) => (
                    <span key={lbl} className="filter-chip">
                      #{lbl}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(lbl)}
                        title="Remove tag"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div className="form-group">
              <div className="form-label">
                <span>Content *</span>
                <span style={{ fontSize: "0.75rem", color: content.length > 10000 ? "var(--danger)" : "var(--text-light)" }}>
                  {content.length}/10,000
                </span>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Write your note content here..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors({ ...errors, content: "" });
                }}
              />
              {errors.content && (
                <span className="form-error">{errors.content}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: "110px", justifyContent: "center" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : note ? (
                "Update Note"
              ) : (
                "Create Note"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
