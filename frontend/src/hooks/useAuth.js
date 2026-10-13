import { useState, useEffect, useCallback } from "react";
import * as authApi from "../api/authApi";
import { deriveAuthHash } from "../lib/crypto";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authApi.getToken());
  const [recoveryKey, setRecoveryKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restore session on initial load
  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      const storedToken = authApi.getToken();
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (mounted && data?.user) {
          setUser(data.user);
        } else if (mounted) {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    // Listen for auth expiration event from notesApi
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setError("Your session has expired. Please sign in again.");
    };
    window.addEventListener("noteflow_auth_expired", handleAuthExpired);

    return () => {
      mounted = false;
      window.removeEventListener("noteflow_auth_expired", handleAuthExpired);
    };
  }, []);

  // Sign up
  const signup = useCallback(async (username, password) => {
    setError("");
    setLoading(true);
    try {
      // 1. Client-side SHA-256 pre-hash: raw password never sent over wire
      const authHash = await deriveAuthHash(username, password);

      // 2. Server registration
      const data = await authApi.register(username, authHash);

      // 3. Store token in sessionStorage
      authApi.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setRecoveryKey(data.recoveryKey); // Shown ONCE!
      return { success: true, recoveryKey: data.recoveryKey };
    } catch (err) {
      setError(err.message || "Failed to create account");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in
  const signin = useCallback(async (username, password) => {
    setError("");
    setLoading(true);
    try {
      const authHash = await deriveAuthHash(username, password);
      const data = await authApi.login(username, authHash);

      authApi.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message || "Invalid username or password");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const reset = useCallback(async (username, inputRecoveryKey, newPassword) => {
    setError("");
    setLoading(true);
    try {
      const newAuthHash = await deriveAuthHash(username, newPassword);
      const data = await authApi.resetPassword(username, inputRecoveryKey, newAuthHash);

      authApi.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setRecoveryKey(data.newRecoveryKey);
      return { success: true, newRecoveryKey: data.newRecoveryKey };
    } catch (err) {
      setError(err.message || "Password reset failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signout = useCallback(() => {
    authApi.clearToken();
    setToken(null);
    setUser(null);
    setRecoveryKey(null);
    setError("");
  }, []);

  const dismissRecoveryKey = useCallback(() => {
    setRecoveryKey(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!user,
    recoveryKey,
    loading,
    error,
    setError,
    signup,
    signin,
    reset,
    signout,
    dismissRecoveryKey,
  };
}
