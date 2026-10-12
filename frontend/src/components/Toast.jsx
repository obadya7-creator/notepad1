import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div key={toast.id} className={`toast ${toast.type || "info"}`}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {isSuccess && (
                <CheckCircle2
                  size={18}
                  style={{ color: "var(--success)", flexShrink: 0 }}
                />
              )}
              {isError && (
                <AlertCircle
                  size={18}
                  style={{ color: "var(--danger)", flexShrink: 0 }}
                />
              )}
              {!isSuccess && !isError && (
                <Info
                  size={18}
                  style={{ color: "var(--primary)", flexShrink: 0 }}
                />
              )}
              <span>{toast.message}</span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                color: "var(--text-light)",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
