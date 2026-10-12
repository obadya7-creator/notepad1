import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  Database,
} from "lucide-react";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenCreateModal,
  theme,
  toggleTheme,
  dbStatus,
  onToggleSidebar,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          className="btn-icon mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          style={{ display: "flex" }}
        >
          <Menu size={20} />
        </button>

        <a href="#" className="nav-brand">
          <div className="brand-icon">
            <FileText size={20} />
          </div>
          <span>NoteFlow</span>
        </a>
      </div>

      <div
        className={`search-container ${mobileSearchOpen ? "mobile-open" : ""}`}
      >
        <Search className="search-icon" size={17} />
        <input
          type="text"
          className="search-input"
          placeholder="Search notes by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchTerm("")}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="nav-actions">
        {/* Mobile Search Toggle */}
        <button
          className="btn-icon mobile-search-btn"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          style={{ display: "none" }}
          aria-label="Toggle search"
        >
          <Search size={18} />
        </button>

        {/* DB Connection Indicator */}
        <div
          className="db-badge"
          title={
            dbStatus?.database === "mongodb"
              ? "MongoDB Connected"
              : "Persistent Storage Active (data/notes.json)"
          }
        >
          <span
            className={`status-dot ${
              dbStatus?.database === "mongodb" ? "online" : "offline"
            }`}
          />
          <Database size={13} style={{ color: "var(--text-muted)" }} />
          <span>
            {dbStatus?.database === "mongodb" ? "MongoDB" : "Local DB"}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Create Note Button */}
        <button className="btn-primary" onClick={onOpenCreateModal}>
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
