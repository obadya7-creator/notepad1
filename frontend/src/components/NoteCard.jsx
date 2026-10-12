import React from "react";
import {
  Pin,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit3,
  Calendar,
} from "lucide-react";

export default function NoteCard({
  note,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Soft pastel card backgrounds with theme adaptation
  const getCardStyle = () => {
    if (note.color && note.color !== "#ffffff") {
      return {
        borderLeft: `4px solid ${note.color}`,
      };
    }
    return {};
  };

  return (
    <div
      className={`note-card ${note.pinned ? "is-pinned" : ""}`}
      style={getCardStyle()}
      onClick={() => onView(note)}
    >
      <div className="note-card-header">
        <div className="note-card-meta">
          {note.category && (
            <span className="category-badge">{note.category}</span>
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
        </div>

        {/* Pin toggle action */}
        <button
          className={`pin-btn ${note.pinned ? "pinned" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          title={note.pinned ? "Unpin note" : "Pin note to top"}
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
        >
          <Pin size={16} fill={note.pinned ? "#f59e0b" : "none"} />
        </button>
      </div>

      <div className="note-card-body">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-content">{note.content}</p>

        {/* Tags */}
        {note.labels && note.labels.length > 0 && (
          <div className="note-tags">
            {note.labels.map((lbl, idx) => (
              <span key={idx} className="note-tag">
                #{lbl}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="note-card-footer" onClick={(e) => e.stopPropagation()}>
        <span className="note-date" title={`Updated: ${note.updatedAt}`}>
          <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
          {formatDate(note.updatedAt || note.createdAt)}
        </span>

        <div className="note-actions">
          {/* Edit Note */}
          <button
            className="note-action-btn"
            onClick={() => onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
          >
            <Edit3 size={15} />
          </button>

          {/* Archive / Restore */}
          <button
            className="note-action-btn"
            onClick={() => onToggleArchive(note)}
            title={note.archived ? "Restore note" : "Archive note"}
            aria-label={note.archived ? "Restore note" : "Archive note"}
          >
            {note.archived ? (
              <ArchiveRestore size={15} />
            ) : (
              <Archive size={15} />
            )}
          </button>

          {/* Delete */}
          <button
            className="note-action-btn delete"
            onClick={() => onDelete(note)}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
