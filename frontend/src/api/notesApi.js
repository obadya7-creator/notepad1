const BASE_URL = "/api";

export async function fetchNotes(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.label) query.set("label", params.label);
  if (params.sort) query.set("sort", params.sort);
  if (params.archived !== undefined) query.set("archived", String(params.archived));
  if (params.pinned !== undefined) query.set("pinned", String(params.pinned));

  const res = await fetch(`${BASE_URL}/notes?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to fetch notes" }));
    throw new Error(err.message || "Failed to fetch notes");
  }
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/notes/meta/stats`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) return null;
  return res.json();
}

export async function createNote(data) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to create note" }));
    throw new Error(err.message || "Failed to create note");
  }
  return res.json();
}

export async function updateNote(id, data) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to update note" }));
    throw new Error(err.message || "Failed to update note");
  }
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to delete note" }));
    throw new Error(err.message || "Failed to delete note");
  }
  return res.json();
}

export async function patchNoteAction(id, action) {
  // action: 'pin' | 'unpin' | 'archive' | 'restore'
  const res = await fetch(`${BASE_URL}/notes/${id}/${action}`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Failed to ${action} note` }));
    throw new Error(err.message || `Failed to ${action} note`);
  }
  return res.json();
}
