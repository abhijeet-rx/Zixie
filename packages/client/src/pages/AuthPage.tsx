import React, { useState } from "react"; import { Navigate } from "react-router-dom"; import { useWorkspace } from "../store/auth"; import { DegradedHealthBanner } from "../components/StatePrimitives";  export const AuthPage: React.FC = () => { const { user, authLoading, login, register, enterPreviewMode, health, refreshHealth, theme, toggleTheme } = useWorkspace();  const [mode, setMode] = useState<"login" | "register">("login"); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false);  const [submitting, setSubmitting] = useState(false); const [errorMessage, setErrorMessage] = useState<string | null>(null);  if (!authLoading && user) { return <Navigate to="/" replace />; }  const validateForm = (): string | null => { if (mode === "register" && name.trim().length < 2) { return "Reviewer name must be at least 2 characters."; } const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailPattern.test(email.trim())) { return "Enter a valid institutional or reviewer email address."; } if (password.length < 8) { return "Password must be at least 8 characters."; } return null; };  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setErrorMessage(null);  const validationError = validateForm(); if (validationError) { setErrorMessage(validationError); return; }  setSubmitting(true); try { if (mode === "login") { await login(email, password); } else { await register(name, email, password); } } catch (err) { setErrorMessage( err instanceof Error ? err.message : "Authentication request failed. Check server status." ); } finally { setSubmitting(false); } };  return ( <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}> <DegradedHealthBanner health={health} onRetry={refreshHealth} />  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)", }} > <div className="mono" style={{ fontWeight: 600 }}> ZIXIE // ACADEMIC INTEGRITY CONSOLE </div> <button type="button" className="btn" onClick={toggleTheme}> Theme: {theme === "dark" ? "Dark" : "Light"} </button> </div>  <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", }} > <div className="panel" style={{ width: "100%", maxWidth: "400px" }}> <div className="panel-header"> <div> <h1 className="panel-title" style={{ fontSize: "15px" }}> {mode === "login" ? "Reviewer Sign In" : "Create Reviewer Account"} </h1> <div className="text-muted" style={{ fontSize: "11px", marginTop: "2px" }}> HttpOnly cookie session • Scoped report ownership </div> </div> <span className={`status-badge ${
                health.status === "healthy" ? "status-badge--clear" : "status-badge--suspicious"
              }`}
            >
              {health.status === "healthy" ? "DB READY" : "DB DEGRADED"}
            </span>
          </div>

          <div className="panel-body">
            <div
              role="tablist"
              aria-label="Authentication mode"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                background: "var(--bg-base)",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "16px",
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`btn ${mode === "login" ? "btn--primary" : "btn--ghost"}`} onClick={() => { setMode("login"); setErrorMessage(null); }} > Sign In </button> <button type="button" role="tab" aria-selected={mode === "register"} className={`btn ${mode === "register" ? "btn--primary" : "btn--ghost"}`}
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                }}
              >
                Create Account
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                style={{
                  padding: "8px 12px",
                  marginBottom: "14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--risk-collusion-bg)",
                  border: "1px solid var(--risk-collusion-border)",
                  color: "var(--risk-collusion-fg)",
                  fontSize: "12px",
                }}
              >
                <strong className="mono">[AUTH ERROR]</strong> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: "12px" }}>
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="auth-name"
                    style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Asha Verma"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reviewer@university.edu"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <label htmlFor="auth-password" style={{ fontSize: "12px" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    style={{ height: "22px", padding: "0 6px", fontSize: "11px" }}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting}
                style={{ width: "100%", marginTop: "4px" }}
              >
                {submitting
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Sign In to Console"
                  : "Register & Establish Session"}
              </button>
            </form>
            {import.meta.env.DEV && (
              <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "16px", paddingTop: "14px" }}>
                <p className="text-secondary" style={{ margin: "0 0 10px", fontSize: "12px" }}>
                  Just looking around? Open the interface with sample data; no account or database is needed.
                </p>
                <button type="button" className="btn" style={{ width: "100%" }} onClick={enterPreviewMode}>
                  Open UI preview
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
