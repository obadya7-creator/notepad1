import React from "react";
import { LayoutGrid, List, X, ArrowUpDown } from "lucide-react";

export default function Toolbar({
  activeView,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  noteCount,
}) {
  const getTitle = () => {
    if (activeView === "pinned") return "Pinned Notes";
    if (activeView === "archived") return "Archived Notes";
    if (selectedCategory) return `${selectedCategory} Notes`;
    if (selectedTag) return `Notes tagged #${selectedTag}`;
    return "All Notes";
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory || selectedTag
  );

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div className="toolbar">
        <div className="toolbar-title-section">
          <h1 className="toolbar-title">{getTitle()}</h1>
          <span className="toolbar-count">
            {noteCount} {noteCount === 1 ? "note" : "notes"}
          </span>
        </div>

        <div className="toolbar-controls">
          {/* Sorting Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowUpDown size={15} style={{ color: "var(--text-light)" }} />
            <select
              className="select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort notes"
            >
              <option value="latest">Latest Updated</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A - Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
              aria-label="List View"
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filters-bar">
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
            Filters:
          </span>

          {searchTerm && (
            <span className="filter-chip">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")} title="Clear search">
                <X size={13} />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="filter-chip">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("")}
                title="Clear category"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {selectedTag && (
            <span className="filter-chip">
              Tag: #{selectedTag}
              <button onClick={() => setSelectedTag("")} title="Clear tag">
                <X size={13} />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedTag("");
            }}
            style={{
              fontSize: "0.8rem",
              color: "var(--primary-text)",
              fontWeight: 600,
              textDecoration: "underline",
              marginLeft: "0.5rem",
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
