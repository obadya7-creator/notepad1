import React from "react";

export default function SkeletonLoader({ count = 6, viewMode = "grid" }) {
  const items = Array.from({ length: count });

  if (viewMode === "list") {
    return (
      <div className="notes-list">
        {items.map((_, i) => (
          <div
            key={i}
            className="note-card"
            style={{
              padding: "1.2rem",
              opacity: 0.65,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "18px",
                  width: "40%",
                  background: "var(--border-color)",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{
                  height: "14px",
                  width: "80%",
                  background: "var(--border-subtle)",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {items.map((_, i) => (
        <div
          key={i}
          className="note-card"
          style={{
            height: "180px",
            opacity: 0.65,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            style={{
              height: "20px",
              width: "60%",
              background: "var(--border-color)",
              borderRadius: "4px",
              marginBottom: "12px",
            }}
          />
          <div
            style={{
              height: "14px",
              width: "90%",
              background: "var(--border-subtle)",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              height: "14px",
              width: "75%",
              background: "var(--border-subtle)",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              height: "14px",
              width: "50%",
              background: "var(--border-subtle)",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              marginTop: "auto",
              height: "14px",
              width: "35%",
              background: "var(--border-color)",
              borderRadius: "4px",
            }}
          />
        </div>
      ))}
    </div>
  );
}
