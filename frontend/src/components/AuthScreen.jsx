import React, { useState } from "react";
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

export default function AuthScreen({ onSignIn, onSignUp, onReset, error, clearError, theme, toggleTheme }) {
  const [tab, setTab] = useState("signin"); // "signin" | "signup" | "reset"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Password strength calculator
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { score: 65, label: "Medium", color: "#f59e0b" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const strength = calculateStrength(password);

  const validate = () => {
    const errs = {};
    const cleanUser = username.trim().toLowerCase();

    if (!cleanUser) {
      errs.username = "Username is required";
    } else if (!/^[a-z0-9_]{3,30}$/.test(cleanUser)) {
      errs.username = "3-30 characters, lowercase letters, numbers & _ only";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (tab === "signup" || tab === "reset") {
      if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match";
      }
    }

    if (tab === "reset") {
      if (!recoveryKey.trim()) {
        errs.recoveryKey = "Recovery key is required";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();
    if (!validate()) return;

    setBusy(true);
    const cleanUser = username.trim().toLowerCase();

    if (tab === "signin") {
      await onSignIn(cleanUser, password);
    } else if (tab === "signup") {
      await onSignUp(cleanUser, password);
    } else if (tab === "reset") {
      await onReset(cleanUser, recoveryKey.trim(), password);
    }
    setBusy(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--bg-primary)",
      }}
    >
      {/* Theme Switcher in Top Right */}
      <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}>
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div
        className="animate-modal"
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
          padding: "2.25rem 2rem",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.35)",
            }}
          >
            <Shield size={30} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            NoteFlow Vault
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Zero-Knowledge Client-Hashed Secure Notes
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: tab === "reset" ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: "0.25rem",
            padding: "0.25rem",
            background: "var(--bg-primary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              clearError?.();
              setFormErrors({});
            }}
            style={{
              padding: "0.55rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              color: tab === "signin" ? "#ffffff" : "var(--text-muted)",
              background: tab === "signin" ? "var(--primary)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("signup");
              clearError?.();
              setFormErrors({});
            }}
            style={{
              padding: "0.55rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              color: tab === "signup" ? "#ffffff" : "var(--text-muted)",
              background: tab === "signup" ? "var(--primary)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            Create Account
          </button>

          {tab === "reset" && (
            <button
              type="button"
              style={{
                padding: "0.55rem 0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                color: "#ffffff",
                background: "var(--primary)",
              }}
            >
              Reset Key
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--danger-light)",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              fontSize: "0.825rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Username Field */}
          <div>
            <label className="form-label" style={{ marginBottom: "0.35rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <User size={14} /> Username
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              style={{ width: "100%" }}
              placeholder="e.g. alex_dev"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (formErrors.username) setFormErrors({ ...formErrors, username: "" });
              }}
              autoComplete="username"
              autoFocus
            />
            {formErrors.username && (
              <span className="form-error" style={{ display: "block", marginTop: "0.25rem" }}>
                {formErrors.username}
              </span>
            )}
          </div>

          {/* Recovery Key Field (Reset Tab Only) */}
          {tab === "reset" && (
            <div>
              <label className="form-label" style={{ marginBottom: "0.35rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <KeyRound size={14} /> 32-Character Recovery Key
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                placeholder="Enter the recovery key given at signup..."
                value={recoveryKey}
                onChange={(e) => {
                  setRecoveryKey(e.target.value);
                  if (formErrors.recoveryKey) setFormErrors({ ...formErrors, recoveryKey: "" });
                }}
              />
              {formErrors.recoveryKey && (
                <span className="form-error" style={{ display: "block", marginTop: "0.25rem" }}>
                  {formErrors.recoveryKey}
                </span>
              )}
            </div>
          )}

          {/* Password Field */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Lock size={14} /> {tab === "reset" ? "New Password" : "Password"}
                </span>
              </label>
              {tab === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setTab("reset");
                    clearError?.();
                    setFormErrors({});
                  }}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--primary-text)",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ width: "100%", paddingRight: "2.6rem" }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                }}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  padding: "2px",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.password && (
              <span className="form-error" style={{ display: "block", marginTop: "0.25rem" }}>
                {formErrors.password}
              </span>
            )}

            {/* Password strength bar for signup & reset */}
            {(tab === "signup" || tab === "reset") && password && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Strength:</span>
                  <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--border-color)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${strength.score}%`,
                      backgroundColor: strength.color,
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field (Signup and Reset) */}
          {(tab === "signup" || tab === "reset") && (
            <div>
              <label className="form-label" style={{ marginBottom: "0.35rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CheckCircle2 size={14} /> Confirm Password
                </span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ width: "100%" }}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                }}
                autoComplete="new-password"
              />
              {formErrors.confirmPassword && (
                <span className="form-error" style={{ display: "block", marginTop: "0.25rem" }}>
                  {formErrors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={busy}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.8rem",
              marginTop: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            {busy ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : tab === "signin" ? (
              "Sign In to Vault"
            ) : tab === "signup" ? (
              "Create Vault Account"
            ) : (
              "Reset Password & Sign In"
            )}
          </button>
        </form>

        {/* Security Assurance footer */}
        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--text-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <Sparkles size={13} style={{ color: "var(--primary)" }} />
          <span>3-Layer Security: Browser SHA-256 + Server bcrypt(12) + JWT</span>
        </div>
      </div>
    </div>
  );
}
