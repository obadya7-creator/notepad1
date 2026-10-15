const BASE_URL = "/api/auth";
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

async function parseAuthResponse(res, defaultErrorMessage) {
  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(
        `Server communication error (${res.status}). Please check that the backend is running on port 5000.`
      );
    }
    throw new Error(defaultErrorMessage);
  }
  if (!res.ok) {
    throw new Error(data?.message || defaultErrorMessage);
  }
  return data;
}

export async function register(username, authHash) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, authHash }),
  });
  return parseAuthResponse(res, "Registration failed");
}

export async function login(username, authHash) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, authHash }),
  });
  return parseAuthResponse(res, "Login failed");
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      clearToken();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function resetPassword(username, recoveryKey, newAuthHash) {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, recoveryKey, newAuthHash }),
  });
  return parseAuthResponse(res, "Password reset failed");
}

