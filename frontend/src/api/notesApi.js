import { getToken, clearToken } from "./authApi";

const BASE_URL = "/api";

function authHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res, defaultErrorMessage) {
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("noteflow_auth_expired"));
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: defaultErrorMessage }));
    throw new Error(err.message || defaultErrorMessage);
  }
  return res.json();
}

export async function fetchNotes(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.label) query.set("label", params.label);
  if (params.sort) query.set("sort", params.sort);
  if (params.archived !== undefined) query.set("archived", String(params.archived));
  if (params.pinned !== undefined) query.set("pinned", String(params.pinned));

  const res = await fetch(`${BASE_URL}/notes?${query.toString()}`, {
    headers: authHeaders(),
  });
  return handleResponse(res, "Failed to fetch notes");
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/notes/meta/stats`, {
    headers: authHeaders(),
  });
  if (res.status === 401) return null;
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
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to create note");
}

export async function updateNote(id, data) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to update note");
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res, "Failed to delete note");
}

export async function patchNoteAction(id, action) {
  // action: 'pin' | 'unpin' | 'archive' | 'restore'
  const res = await fetch(`${BASE_URL}/notes/${id}/${action}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res, `Failed to ${action} note`);
}
