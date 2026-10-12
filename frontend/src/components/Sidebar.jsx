import React from "react";
import {
  FileText,
  Pin,
  Archive,
  Tag,
  Folder,
  Server,
} from "lucide-react";

const CATEGORY_COLORS = {
  Work: "#3b82f6",
  Personal: "#10b981",
  Ideas: "#8b5cf6",
  Study: "#f59e0b",
  Tasks: "#ec4899",
  General: "#64748b",
};

export default function Sidebar({
  activeView,
  setActiveView,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  stats,
  isOpen,
  onClose,
}) {
  const categories = [
    "All",
    "Work",
    "Personal",
    "Ideas",
    "Study",
    "Tasks",
    ...(stats?.categories?.filter(
      (c) => !["All", "Work", "Personal", "Ideas", "Study", "Tasks"].includes(c)
    ) || []),
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Navigation Section */}
        <div>
          <div className="nav-section-title">Views</div>
          <nav className="nav-list">
            <button
              className={`nav-item ${activeView === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveView("all");
                if (window.innerWidth < 900) onClose();
              }}
            >
              <div className="nav-item-left">
                <FileText size={18} />
                <span>All Notes</span>
              </div>
              <span className="badge">{stats?.active ?? 0}</span>
            </button>

            <button
              className={`nav-item ${activeView === "pinned" ? "active" : ""}`}
              onClick={() => {
                setActiveView("pinned");
                if (window.innerWidth < 900) onClose();
              }}
            >
              <div className="nav-item-left">
                <Pin size={18} />
                <span>Pinned</span>
              </div>
              <span className="badge">{stats?.pinned ?? 0}</span>
            </button>

            <button
              className={`nav-item ${activeView === "archived" ? "active" : ""}`}
              onClick={() => {
                setActiveView("archived");
                if (window.innerWidth < 900) onClose();
              }}
            >
              <div className="nav-item-left">
                <Archive size={18} />
                <span>Archived</span>
              </div>
              <span className="badge">{stats?.archived ?? 0}</span>
            </button>
          </nav>
        </div>

        {/* Categories Section */}
        <div>
          <div className="nav-section-title">Categories</div>
          <div className="nav-list">
            {categories.map((cat) => {
              const isSelected =
                (cat === "All" && !selectedCategory) ||
                selectedCategory === cat;
              const dotColor = CATEGORY_COLORS[cat] || "#6366f1";

              return (
                <button
                  key={cat}
                  className={`category-item ${isSelected ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat === "All" ? "" : cat);
                    if (window.innerWidth < 900) onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      className="category-dot"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span>{cat}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Labels / Tags Cloud Section */}
        {stats?.labels && stats.labels.length > 0 && (
          <div>
            <div className="nav-section-title">
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Tag size={12} /> Tags
              </span>
            </div>
            <div className="tags-cloud">
              {stats.labels.map((lbl) => (
                <button
                  key={lbl}
                  className={`tag-pill ${selectedTag === lbl ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTag(selectedTag === lbl ? "" : lbl);
                    if (window.innerWidth < 900) onClose();
                  }}
                >
                  #{lbl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer info box */}
        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <div
            style={{
              padding: "0.85rem",
              background: "var(--bg-primary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
              <Server size={14} style={{ color: "var(--primary)" }} />
              <span>Full-Stack REST API</span>
            </div>
            <div>
              Storage:{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {stats?.storageMode === "mongodb" ? "MongoDB Atlas / Local" : "Persistent File"}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
