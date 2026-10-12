import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import NoteCard from "./components/NoteCard";
import NoteEditorModal from "./components/NoteEditorModal";
import NoteViewModal from "./components/NoteViewModal";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";
import EmptyState from "./components/EmptyState";
import SkeletonLoader from "./components/SkeletonLoader";
import * as api from "./api/notesApi";
import { Pin, FileText } from "lucide-react";
import "./App.css";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("noteflow_theme") || "light";
  });

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("noteflow_view") || "grid";
  });

  // Filter & Search states
  const [activeView, setActiveView] = useState("all"); // 'all' | 'pinned' | 'archived'
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Data states
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("noteflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // View mode persistence
  useEffect(() => {
    localStorage.setItem("noteflow_view", viewMode);
  }, [viewMode]);

  // Load database status
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.fetchHealth();
      setDbStatus(data);
    } catch (err) {
      setDbStatus(null);
    }
  }, []);

  // Fetch stats summary
  const loadStats = useCallback(async () => {
    try {
      const data = await api.fetchStats();
      if (data) setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Fetch notes based on current filters
  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortBy,
        archived: activeView === "archived",
      };

      if (activeView === "pinned") {
        params.pinned = true;
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (selectedTag) {
        params.label = selectedTag;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await api.fetchNotes(params);
      setNotes(data || []);
      loadStats();
    } catch (err) {
      addToast(err.message || "Failed to load notes", "error");
    } finally {
      setLoading(false);
    }
  }, [activeView, selectedCategory, selectedTag, searchTerm, sortBy, addToast, loadStats]);

  // Initial load
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Debounced search / filter reload
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  // CRUD Actions
  const handleOpenCreate = () => {
    setNoteToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note) => {
    setViewingNote(null);
    setNoteToEdit(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (data) => {
    try {
      if (noteToEdit) {
        await api.updateNote(noteToEdit._id, data);
        addToast("Note updated successfully!", "success");
      } else {
        await api.createNote(data);
        addToast("Note created successfully!", "success");
      }
      await loadNotes();
      return true;
    } catch (err) {
      addToast(err.message || "Error saving note", "error");
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteNote(noteToDelete._id);
      addToast("Note permanently deleted.", "info");
      setNoteToDelete(null);
      if (viewingNote?._id === noteToDelete._id) {
        setViewingNote(null);
      }
      await loadNotes();
    } catch (err) {
      addToast(err.message || "Failed to delete note", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async (note) => {
    const nextAction = note.pinned ? "unpin" : "pin";
    try {
      const updated = await api.patchNoteAction(note._id, nextAction);
      addToast(
        note.pinned ? "Note unpinned." : "Note pinned to top!",
        "success"
      );
      // Update local state smoothly
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? updated : n))
      );
      if (viewingNote?._id === note._id) {
        setViewingNote(updated);
      }
      loadNotes();
    } catch (err) {
      addToast(err.message || "Failed to pin note", "error");
    }
  };

  const handleToggleArchive = async (note) => {
    const nextAction = note.archived ? "restore" : "archive";
    try {
      await api.patchNoteAction(note._id, nextAction);
      addToast(
        note.archived ? "Note restored to active notes!" : "Note moved to archive.",
        "success"
      );
      if (viewingNote?._id === note._id) {
        setViewingNote(null);
      }
      loadNotes();
    } catch (err) {
      addToast(err.message || "Failed to update archive status", "error");
    }
  };

  // Split notes into Pinned and Others when in "All Notes" view
  const { pinnedNotes, otherNotes } = useMemo(() => {
    if (activeView === "pinned") {
      return { pinnedNotes: notes, otherNotes: [] };
    }
    if (activeView === "archived") {
      return { pinnedNotes: [], otherNotes: notes };
    }
    const pinned = notes.filter((n) => n.pinned);
    const others = notes.filter((n) => !n.pinned);
    return { pinnedNotes: pinned, otherNotes: others };
  }, [notes, activeView]);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenCreateModal={handleOpenCreate}
        theme={theme}
        toggleTheme={toggleTheme}
        dbStatus={dbStatus}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="main-wrapper">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setSelectedCategory("");
            setSelectedTag("");
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          stats={stats}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Central Dashboard Content Area */}
        <main className="content-area">
          <Toolbar
            activeView={activeView}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            noteCount={notes.length}
          />

          {loading ? (
            <SkeletonLoader count={6} viewMode={viewMode} />
          ) : notes.length === 0 ? (
            <EmptyState
              activeView={activeView}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              searchTerm={searchTerm}
              onOpenCreate={handleOpenCreate}
              onClearFilters={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedTag("");
                setActiveView("all");
              }}
            />
          ) : (
            <div>
              {/* Pinned Notes Section (When in All view and pinned notes exist) */}
              {activeView === "all" && pinnedNotes.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <div className="notes-section-title">
                    <Pin size={15} fill="#f59e0b" color="#f59e0b" />
                    <span>Pinned ({pinnedNotes.length})</span>
                  </div>
                  <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onView={setViewingNote}
                        onEdit={handleOpenEdit}
                        onDelete={setNoteToDelete}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Notes Section */}
              {activeView === "all" && pinnedNotes.length > 0 && otherNotes.length > 0 && (
                <div className="notes-section-title">
                  <FileText size={15} />
                  <span>Other Notes ({otherNotes.length})</span>
                </div>
              )}

              <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
                {(activeView === "all" && pinnedNotes.length > 0
                  ? otherNotes
                  : notes
                ).map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onView={setViewingNote}
                    onEdit={handleOpenEdit}
                    onDelete={setNoteToDelete}
                    onTogglePin={handleTogglePin}
                    onToggleArchive={handleToggleArchive}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Note Editor Modal (Create / Edit) */}
      {isEditorOpen && (
        <NoteEditorModal
          note={noteToEdit}
          onSave={handleSaveNote}
          onClose={() => {
            setIsEditorOpen(false);
            setNoteToEdit(null);
          }}
        />
      )}

      {/* Note Reader View Modal */}
      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={handleOpenEdit}
          onDelete={setNoteToDelete}
          onTogglePin={handleTogglePin}
          onToggleArchive={handleToggleArchive}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(noteToDelete)}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title || "this note"}"? This action cannot be undone.`}
        confirmText="Delete Note"
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
        isBusy={isDeleting}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
