import React, { useMemo } from "react";
import {
  FileText,
  Pin,
  Archive,
  Tag,
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
  onSelectView,
  selectedCategory,
  setSelectedCategory,
  onSelectCategory,
  selectedTag,
  setSelectedTag,
  onSelectTag,
  stats,
  notes = [],
  isOpen = false,
  isCollapsed = false,
  onClose,
}) {
  const handleViewClick = (view) => {
    if (onSelectView) {
      onSelectView(view);
    } else if (setActiveView) {
      setActiveView(view);
      if (setSelectedCategory) setSelectedCategory("");
      if (setSelectedTag) setSelectedTag("");
    }
    if (window.innerWidth <= 900 && onClose) onClose();
  };

  const handleCategoryClick = (cat) => {
    const target = cat === "All" ? "" : cat;
    if (onSelectCategory) {
      onSelectCategory(target);
    } else {
      if (setSelectedCategory) setSelectedCategory(target);
      if (setActiveView) setActiveView("all");
      if (setSelectedTag) setSelectedTag("");
    }
    if (window.innerWidth <= 900 && onClose) onClose();
  };

  const handleTagClick = (lbl) => {
    const target = selectedTag === lbl ? "" : lbl;
    if (onSelectTag) {
      onSelectTag(target);
    } else {
      if (setSelectedTag) setSelectedTag(target);
      if (setActiveView) setActiveView("all");
      if (setSelectedCategory) setSelectedCategory("");
    }
    if (window.innerWidth <= 900 && onClose) onClose();
  };

  // Distinct category list
  const categories = useMemo(() => {
    const base = ["All", "Work", "Personal", "Ideas", "Study", "Tasks", "General"];
    const dynamic = (stats?.categories || []).filter((c) => !base.includes(c));
    return [...base, ...dynamic];
  }, [stats?.categories]);

  // Count active notes per category
  const categoryCounts = useMemo(() => {
    const map = {};
    if (Array.isArray(notes)) {
      notes.forEach((n) => {
        if (!n.archived) {
          const c = n.category || "General";
          map[c] = (map[c] || 0) + 1;
        }
      });
    }
    return map;
  }, [notes]);

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        {/* Navigation Views Section */}
        <div>
          <div className="nav-section-title">Views</div>
          <nav className="nav-list">
            <button
              type="button"
              className={`nav-item ${
                activeView === "all" && !selectedCategory && !selectedTag
                  ? "active"
                  : ""
              }`}
              onClick={() => handleViewClick("all")}
            >
              <div className="nav-item-left">
                <FileText size={18} />
                <span>All Notes</span>
              </div>
              <span className="badge">{stats?.active ?? notes?.filter((n) => !n.archived)?.length ?? 0}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeView === "pinned" ? "active" : ""}`}
              onClick={() => handleViewClick("pinned")}
            >
              <div className="nav-item-left">
                <Pin size={18} />
                <span>Pinned</span>
              </div>
              <span className="badge">{stats?.pinned ?? notes?.filter((n) => n.pinned && !n.archived)?.length ?? 0}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeView === "archived" ? "active" : ""}`}
              onClick={() => handleViewClick("archived")}
            >
              <div className="nav-item-left">
                <Archive size={18} />
                <span>Archived</span>
              </div>
              <span className="badge">{stats?.archived ?? notes?.filter((n) => n.archived)?.length ?? 0}</span>
            </button>
          </nav>
        </div>

        {/* Categories Section */}
        <div>
          <div className="nav-section-title">Categories</div>
          <div className="nav-list">
            {categories.map((cat) => {
              const isSelected =
                cat === "All"
                  ? !selectedCategory && !selectedTag && activeView === "all"
                  : selectedCategory === cat;
              const dotColor = CATEGORY_COLORS[cat] || "#6366f1";
              const count = cat === "All"
                ? (stats?.active ?? notes?.filter((n) => !n.archived)?.length ?? 0)
                : (categoryCounts[cat] || 0);

              return (
                <button
                  type="button"
                  key={cat}
                  className={`category-item ${isSelected ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      className="category-dot"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span>{cat}</span>
                  </div>
                  {count > 0 && <span className="badge">{count}</span>}
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
                  type="button"
                  key={lbl}
                  className={`tag-pill ${selectedTag === lbl ? "active" : ""}`}
                  onClick={() => handleTagClick(lbl)}
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
                {stats?.storageMode === "mongodb" ? "MongoDB Atlas" : "Local File Vault"}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
