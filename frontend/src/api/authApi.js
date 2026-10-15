const BASE_URL = import.meta.env.VITE_AUTH_ENDPOINT || "/api/auth";
const TOKEN_KEY = "noteflow_token";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function register(username, authHash) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, authHash }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

export async function login(username, authHash) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, authHash }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearToken();
    return null;
  }
  return res.json();
}

export async function resetPassword(username, recoveryKey, newAuthHash) {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, recoveryKey, newAuthHash }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Password reset failed");
  }
  return data;
}
