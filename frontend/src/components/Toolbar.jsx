import React, { useState } from "react";
import { LayoutGrid, List, X, ArrowUpDown, Download, FileJson, FileText } from "lucide-react";

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
  onExport,
}) {
  const [exportOpen, setExportOpen] = useState(false);
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

          {/* Export Notes Dropdown */}
          {onExport && (
            <div style={{ position: "relative" }}>
              <button
                className="btn-secondary"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem", gap: "0.4rem" }}
                onClick={() => setExportOpen(!exportOpen)}
                title="Export Notes Vault"
              >
                <Download size={15} />
                <span>Export</span>
              </button>

              {exportOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    onClick={() => setExportOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 50,
                      minWidth: "170px",
                      padding: "0.4rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <button
                      className="btn-secondary"
                      style={{
                        justifyContent: "flex-start",
                        border: "none",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.82rem",
                        gap: "0.5rem",
                        background: "transparent",
                      }}
                      onClick={() => {
                        setExportOpen(false);
                        onExport("json");
                      }}
                    >
                      <FileJson size={15} style={{ color: "var(--primary)" }} />
                      <span>Export as JSON</span>
                    </button>
                    <button
                      className="btn-secondary"
                      style={{
                        justifyContent: "flex-start",
                        border: "none",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.82rem",
                        gap: "0.5rem",
                        background: "transparent",
                      }}
                      onClick={() => {
                        setExportOpen(false);
                        onExport("markdown");
                      }}
                    >
                      <FileText size={15} style={{ color: "#10b981" }} />
                      <span>Export as Markdown</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
