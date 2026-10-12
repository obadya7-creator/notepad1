import React from "react";
import { FileQuestion, SearchX, Archive, Pin, Plus } from "lucide-react";

export default function EmptyState({
  activeView,
  selectedCategory,
  selectedTag,
  searchTerm,
  onOpenCreate,
  onClearFilters,
}) {
  if (searchTerm) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <SearchX size={32} />
        </div>
        <h3 className="empty-title">No notes found</h3>
        <p className="empty-desc">
          We couldn't find any notes matching "<strong>{searchTerm}</strong>".
          Try searching for different keywords.
        </p>
        <button className="btn-secondary" onClick={onClearFilters}>
          Clear Search
        </button>
      </div>
    );
  }

  if (activeView === "pinned") {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
          <Pin size={32} />
        </div>
        <h3 className="empty-title">No pinned notes</h3>
        <p className="empty-desc">
          Pin your most important notes to keep them easily accessible at the top of your dashboard.
        </p>
      </div>
    );
  }

  if (activeView === "archived") {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Archive size={32} />
        </div>
        <h3 className="empty-title">Archive is empty</h3>
        <p className="empty-desc">
          Notes you archive will appear here. You can restore them anytime.
        </p>
      </div>
    );
  }

  if (selectedCategory || selectedTag) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FileQuestion size={32} />
        </div>
        <h3 className="empty-title">No matching notes</h3>
        <p className="empty-desc">
          No notes found under the selected filters.
        </p>
        <button className="btn-secondary" onClick={onClearFilters}>
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileQuestion size={32} />
      </div>
      <h3 className="empty-title">Capture your thoughts</h3>
      <p className="empty-desc">
        Your notepad is empty right now. Create your first note to get started organizing your ideas, tasks, and notes!
      </p>
      <button className="btn-primary" onClick={onOpenCreate}>
        <Plus size={18} />
        <span>Create First Note</span>
      </button>
    </div>
  );
}
