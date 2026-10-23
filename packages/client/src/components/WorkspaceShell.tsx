import React, { useRef, useState, useEffect } from "react"; import { NavLink, Outlet, useNavigate } from "react-router-dom"; import { useWorkspace } from "../store/auth"; import { DegradedHealthBanner } from "./StatePrimitives";  interface NavItem { to: string; label: string; code: string; isLocalPrototype?: boolean; }  const CORE_ROUTES: NavItem[] = [ { to: "/", label: "Overview", code: "01" }, { to: "/submissions", label: "Submissions", code: "02" }, { to: "/similarity", label: "Similarity", code: "03" }, { to: "/ai-detection", label: "AI Signals", code: "04" }, { to: "/reports", label: "Reports", code: "05" }, ];  const PROTOTYPE_ROUTES: NavItem[] = [ { to: "/assessments", label: "Assessments", code: "L1", isLocalPrototype: true }, { to: "/team", label: "Team", code: "L2", isLocalPrototype: true }, { to: "/integrations", label: "Integrations", code: "L3", isLocalPrototype: true }, { to: "/settings", label: "Settings", code: "L4", isLocalPrototype: true }, ];  export const WorkspaceShell: React.FC = () => { const { user, health, refreshHealth, logout, activePayload, loadDemoCohort, isPreviewMode, theme, toggleTheme, } = useWorkspace(); const navigate = useNavigate(); const searchInputRef = useRef<HTMLInputElement | null>(null); const [searchQuery, setSearchQuery] = useState("");  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if ( e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" ) { e.preventDefault(); searchInputRef.current?.focus(); } }; window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, []);  const handleGlobalSearch = (e: React.FormEvent) => { e.preventDefault(); const q = searchQuery.trim(); if (!q) return;  const lower = q.toLowerCase(); const matchedNav = [...CORE_ROUTES, ...PROTOTYPE_ROUTES].find((r) => r.label.toLowerCase().includes(lower) ); if (matchedNav) { navigate(matchedNav.to); setSearchQuery(""); return; }  navigate(`/submissions?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!isPreviewMode && <DegradedHealthBanner health={health} onRetry={refreshHealth} />}

      <div className="app-shell" style={{ flex: 1 }}>
        <aside className="nav-rail" aria-label="Primary workspace navigation">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px 16px 8px",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: "12px",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.02em" }}>
                  ZIXIE
                </div>
                <div className="mono text-muted" style={{ fontSize: "11px" }}>
                  INTEGRITY CONSOLE
                </div>
              </div>
              <span
                className={`status-badge ${ isPreviewMode ? "status-badge--neutral" : health.status === "healthy" ? "status-badge--clear" : "status-badge--suspicious" }`} > {isPreviewMode ? "PREVIEW" : health.status === "healthy" ? "API OK" : "DEGRADED"} </span> </div>  <div style={{ marginBottom: "16px" }}> <div className="mono text-muted" style={{ fontSize: "10px", padding: "4px 8px", textTransform: "uppercase" }} > Evidence & Triage </div> <nav style={{ display: "grid", gap: "2px" }}> {CORE_ROUTES.map((item) => ( <NavLink key={item.to} to={item.to} end={item.to === "/"} style={({ isActive }) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: "12px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text-primary)" : "var(--text-secondary)", background: isActive ? "var(--bg-active)" : "transparent", })} > <span>{item.label}</span> <span className="mono text-muted" style={{ fontSize: "10px" }}> {item.code} </span> </NavLink> ))} </nav> </div>  <div> <div className="mono text-muted" style={{ fontSize: "10px", padding: "4px 8px", textTransform: "uppercase" }} > Local Prototypes (Unpersisted) </div> <nav style={{ display: "grid", gap: "2px" }}> {PROTOTYPE_ROUTES.map((item) => ( <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: "12px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text-primary)" : "var(--text-secondary)", background: isActive ? "var(--bg-active)" : "transparent", })} > <span>{item.label}</span> <span className="mono" style={{ fontSize: "10px", padding: "1px 4px", borderRadius: "3px", background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)", }} > LOCAL </span> </NavLink> ))} </nav> </div> </div>  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "grid", gap: "8px", }} > <div style={{ padding: "0 4px" }}> <div style={{ fontWeight: 500, fontSize: "12px" }}> {user?.name || "Authenticated Reviewer"} </div> <div className="mono text-muted" style={{ fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", }} > {user?.email || "Session active"} </div> </div> <button type="button" className="btn" onClick={logout} style={{ width: "100%" }}> Sign Out </button> </div> </aside>  <div className="workspace-main"> <header className="workspace-header"> <form onSubmit={handleGlobalSearch} style={{ flex: "1 1 320px", maxWidth: "440px", display: "flex", gap: "6px" }} > <input ref={searchInputRef} type="search" className="input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Jump to candidate, filename, or route (Press '/' to focus)" aria-label="Search candidates or routes" /> </form>  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}> {activePayload ? ( <span className="status-badge status-badge--neutral"> <span> {isPreviewMode ? "COHORT: LOCAL PREVIEW" : activePayload.source === "demo" ? "COHORT: /api/demo SAMPLE" : `REPORT: ${activePayload.reportId.slice(0, 12)}`}
                  </span>
                  <span>({activePayload.candidates.length} files)</span>
                </span>
              ) : (
                <span className="status-badge status-badge--neutral">NO REPORT LOADED</span>
              )}

              <button
                type="button"
                className="btn"
                onClick={loadDemoCohort}
                title={isPreviewMode ? "Reload local sample cohort" : "Reload sample cohort from GET /api/demo"}
              >
                {isPreviewMode ? "Reload sample" : "Load /api/demo"}
              </button>

              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate("/submissions?upload=1")}
                disabled={isPreviewMode}
              >
                Upload Batch
              </button>

              <button
                type="button"
                className="btn"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} > Theme: {theme === "dark" ? "Dark" : "Light"} </button> </div> </header>  {isPreviewMode && ( <div className="system-banner system-banner--prototype" role="note">LOCAL UI PREVIEW — SAMPLE DATA ONLY. Sign-in, uploads, and saved reports are disabled here.</div> )} <main className="workspace-content"> <Outlet /> </main> </div> </div> </div> ); };
