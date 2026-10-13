import React, { useState } from "react";
import { KeyRound, Copy, Check, AlertTriangle, X } from "lucide-react";

export default function RecoveryBanner({ recoveryKey, onDismiss }) {
  const [copied, setCopied] = useState(false);

  if (!recoveryKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      style={{
        margin: "1rem 2rem 0",
        padding: "1.25rem 1.5rem",
        borderRadius: "var(--radius-lg)",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.08))",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        boxShadow: "var(--shadow-md)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.2)",
            color: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <KeyRound size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.25rem",
            }}
          >
            <AlertTriangle size={17} style={{ color: "#d97706" }} />
            <span>Save Your Account Recovery Key (Shown Once!)</span>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
              marginBottom: "0.75rem",
            }}
          >
            Because passwords are protected with client-side zero-knowledge hashing, this recovery
            key is the <strong>only way</strong> to reset your password if you ever forget it.
            Store it somewhere secure (like a password manager).
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                background: "var(--bg-surface)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                color: "var(--text-main)",
                userSelect: "all",
              }}
            >
              {recoveryKey}
            </div>

            <button
              onClick={handleCopy}
              className="btn-primary"
              style={{
                padding: "0.55rem 1rem",
                fontSize: "0.825rem",
                background: copied ? "var(--success)" : "var(--primary)",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Key"}</span>
            </button>

            <button
              onClick={onDismiss}
              className="btn-secondary"
              style={{
                padding: "0.55rem 1rem",
                fontSize: "0.825rem",
              }}
            >
              I have saved my key
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "var(--text-light)",
            padding: "4px",
            borderRadius: "var(--radius-sm)",
          }}
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
