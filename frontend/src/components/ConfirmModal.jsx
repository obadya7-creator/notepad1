import React, { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Delete Note",
  message = "Are you sure you want to permanently delete this note? This action cannot be undone.",
  confirmText = "Delete",
  onConfirm,
  onCancel,
  isBusy = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isBusy) onCancel();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isBusy, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={isBusy ? undefined : onCancel}>
      <div
        className="modal-content animate-modal"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem 1.5rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "var(--danger-light)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <AlertTriangle size={26} />
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {title}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isBusy}
            style={{ minWidth: "90px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isBusy}
            style={{ minWidth: "110px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            {isBusy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
