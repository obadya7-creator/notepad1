import { getToken, clearToken } from "./authApi";

const RAW_API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const NOTES_ENDPOINT = (import.meta.env.VITE_NOTES_ENDPOINT || "/api/notes").trim();
const HEALTH_ENDPOINT = (import.meta.env.VITE_HEALTH_ENDPOINT || "/api/health").trim();

const NOTES_BASE = (NOTES_ENDPOINT.startsWith("http://") || NOTES_ENDPOINT.startsWith("https://"))
  ? NOTES_ENDPOINT.replace(/\/+$/, "")
  : RAW_API_URL
  ? `${RAW_API_URL}${NOTES_ENDPOINT.startsWith("/") ? NOTES_ENDPOINT : `/${NOTES_ENDPOINT}`}`
  : NOTES_ENDPOINT;

const HEALTH_BASE = (HEALTH_ENDPOINT.startsWith("http://") || HEALTH_ENDPOINT.startsWith("https://"))
  ? HEALTH_ENDPOINT.replace(/\/+$/, "")
  : RAW_API_URL
  ? `${RAW_API_URL}${HEALTH_ENDPOINT.startsWith("/") ? HEALTH_ENDPOINT : `/${HEALTH_ENDPOINT}`}`
  : HEALTH_ENDPOINT;

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

  const res = await fetch(`${NOTES_BASE}?${query.toString()}`, {
    headers: authHeaders(),
  });
  return handleResponse(res, "Failed to fetch notes");
}

export async function fetchStats() {
  const res = await fetch(`${NOTES_BASE}/meta/stats`, {
    headers: authHeaders(),
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(HEALTH_BASE);
  if (!res.ok) return null;
  return res.json();
}

export async function createNote(data) {
  const res = await fetch(NOTES_BASE, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to create note");
}

export async function updateNote(id, data) {
  const res = await fetch(`${NOTES_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to update note");
}

export async function deleteNote(id) {
  const res = await fetch(`${NOTES_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res, "Failed to delete note");
}

export async function patchNoteAction(id, action) {
  // action: 'pin' | 'unpin' | 'archive' | 'restore'
  const res = await fetch(`${NOTES_BASE}/${id}/${action}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res, `Failed to ${action} note`);
}
