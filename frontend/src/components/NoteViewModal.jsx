import React, { useEffect } from "react";
import {
  X,
  Edit3,
  Archive,
  ArchiveRestore,
  Trash2,
  Pin,
  Calendar,
  Clock,
  Folder,
} from "lucide-react";

export default function NoteViewModal({
  note,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!note) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-modal"
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {note.category && (
              <span className="category-badge">
                <Folder size={12} style={{ display: "inline", marginRight: "3px" }} />
                {note.category}
              </span>
            )}
            {note.pinned && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#f59e0b",
                }}
              >
                <Pin size={12} fill="#f59e0b" /> Pinned
              </span>
            )}
            {note.archived && (
              <span className="badge" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                Archived
              </span>
            )}
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              lineHeight: 1.3,
              color: "var(--text-main)",
            }}
          >
            {note.title}
          </h1>

          {/* Timestamps */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              fontSize: "0.8rem",
              color: "var(--text-light)",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.75rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Calendar size={13} /> Created: {formatDate(note.createdAt)}
            </span>
            {note.updatedAt && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={13} /> Updated: {formatDate(note.updatedAt)}
              </span>
            )}
          </div>

          {/* Content */}
          <div
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--text-main)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {note.content}
          </div>

          {/* Tags */}
          {note.labels && note.labels.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-light)",
                  marginBottom: "0.4rem",
                }}
              >
                Labels & Tags:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {note.labels.map((lbl, idx) => (
                  <span key={idx} className="filter-chip">
                    #{lbl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {/* Pin Toggle */}
            <button
              className="btn-secondary"
              onClick={() => onTogglePin(note)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Pin size={15} fill={note.pinned ? "#f59e0b" : "none"} />
              <span>{note.pinned ? "Unpin" : "Pin"}</span>
            </button>

            {/* Archive Toggle */}
            <button
              className="btn-secondary"
              onClick={() => onToggleArchive(note)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {note.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              <span>{note.archived ? "Restore" : "Archive"}</span>
            </button>

            {/* Delete */}
            <button
              className="btn-secondary"
              onClick={() => onDelete(note)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--danger)",
              }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={() => onEdit(note)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Edit3 size={16} />
            <span>Edit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}
