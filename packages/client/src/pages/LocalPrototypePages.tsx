import React, { useState } from "react";  const PrototypeNoticeBanner: React.FC<{ featureName: string; detail: string }> = ({ featureName, detail, }) => ( <div className="system-banner--prototype" role="note"> <div className="mono" style={{ fontWeight: 700, marginBottom: "4px" }}> [LOCAL PROTOTYPE ONLY — NO SERVER PERSISTENCE: {featureName.toUpperCase()}] </div> <div style={{ fontSize: "12px" }}>{detail}</div> </div> );  export const AssessmentsPage: React.FC = () => { const [draftTitle, setDraftTitle] = useState( () => window.localStorage.getItem("zixie_draft_assessment_title") || "" ); const [draftLang, setDraftLang] = useState( () => window.localStorage.getItem("zixie_draft_assessment_lang") || "python" ); const [localAssessments, setLocalAssessments] = useState([ { id: "local-1", title: "CS201 — Data Structures Lab 3", language: "python", note: "Local seed" }, { id: "local-2", title: "CS310 — Graph Algorithms Assignment", language: "cpp", note: "Local seed" }, ]);  const handleAddLocal = (e: React.FormEvent) => { e.preventDefault(); if (!draftTitle.trim()) return; setLocalAssessments((prev) => [ { id: `local-${Date.now()}`,
        title: draftTitle.trim(),
        language: draftLang,
        note: "Browser memory only",
      },
      ...prev,
    ]);
    setDraftTitle("");
    window.localStorage.removeItem("zixie_draft_assessment_title");
  };

  return (
    <div>
      <PrototypeNoticeBanner
        featureName="Assessments"
        detail="The backend currently processes uploaded batches directly as Reports (POST /api/analyze) rather than persisted Assessment entities. Items added below exist only in local browser state."
      />
      <div className="panel" style={{ marginBottom: "16px" }}>
        <div className="panel-header">
          <h1 className="panel-title">Local Assessment Draft</h1>
          <span className="status-badge status-badge--neutral">UNPERSISTED</span>
        </div>
        <div className="panel-body">
          <form
            onSubmit={handleAddLocal}
            style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: "8px" }}
          >
            <input
              className="input"
              placeholder="Assessment title (stored in local state only)..."
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                window.localStorage.setItem("zixie_draft_assessment_title", e.target.value);
              }}
            />
            <select
              className="select"
              value={draftLang}
              onChange={(e) => {
                setDraftLang(e.target.value);
                window.localStorage.setItem("zixie_draft_assessment_lang", e.target.value);
              }}
            >
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button type="submit" className="btn">
              Add Local Row
            </button>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Local Assessment Placeholder List</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Primary Language</th>
              <th>Persistence Status</th>
            </tr>
          </thead>
          <tbody>
            {localAssessments.map((item) => (
              <tr key={item.id}>
                <td className="mono">{item.id}</td>
                <td>{item.title}</td>
                <td className="mono">{item.language}</td>
                <td>
                  <span className="status-badge status-badge--neutral">{item.note}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TeamPage: React.FC = () => {
  return (
    <div>
      <PrototypeNoticeBanner
        featureName="Team Management"
        detail="There is no backend API for multi-reviewer team rosters or role invitations. Each authenticated account currently owns its reports independently."
      />
      <div className="panel">
        <div className="panel-header">
          <h1 className="panel-title">Reviewer Roster (Static Prototype)</h1>
          <span className="status-badge status-badge--neutral">LOCAL MOCK</span>
        </div>
        <div className="panel-body text-secondary">
          Multi-user organization sharing is not wired in <code className="mono">packages/server</code>.
          Report access in <code className="mono">GET /api/reports/:id</code> is strictly scoped to
          the single authenticated owner ID stored on the report document.
        </div>
      </div>
    </div>
  );
};

export const IntegrationsPage: React.FC = () => {
  return (
    <div>
      <PrototypeNoticeBanner
        featureName="LMS & Webhook Integrations"
        detail="LMS connectors (Canvas, Gradescope, GitHub Classroom) are UI placeholders only and have no backend handlers."
      />
      <div className="panel">
        <div className="panel-header">
          <h1 className="panel-title">Planned LMS Connectors (Unwired)</h1>
          <span className="status-badge status-badge--neutral">LOCAL MOCK</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Connector</th>
              <th>Ingestion Method</th>
              <th>Backend Endpoint Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gradescope Archive Import</td>
              <td>Manual ZIP upload via /submissions</td>
              <td className="mono text-muted">Not wired (use POST /api/analyze)</td>
            </tr>
            <tr>
              <td>Canvas LMS Assignment Sync</td>
              <td>OAuth2 / LTI 1.3</td>
              <td className="mono text-muted">Not wired</td>
            </tr>
            <tr>
              <td>GitHub Classroom Repositories</td>
              <td>Webhook batch pull</td>
              <td className="mono text-muted">Not wired</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [suspiciousThreshold, setSuspiciousThreshold] = useState(0.55);
  const [collusionThreshold, setCollusionThreshold] = useState(0.80);

  return (
    <div>
      <PrototypeNoticeBanner
        featureName="Engine Threshold Settings"
        detail="Values edited on this screen are held in local React state only. The server analysis engine (packages/engine) uses its compiled defaults: Winnowing k=8, w=6, Greedy String Tiling minRun=5, suspicious=0.55, collusion=0.80, cluster join=0.70."
      />
      <div className="panel">
        <div className="panel-header">
          <h1 className="panel-title">Engine Reference Thresholds (Read / Local Preview)</h1>
          <span className="status-badge status-badge--neutral">LOCAL STATE ONLY</span>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "12px", maxWidth: "520px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Suspicious Pair Threshold (Engine Default: 0.55)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="0.95"
              className="input mono"
              value={suspiciousThreshold}
              onChange={(e) => setSuspiciousThreshold(Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Collusion Detected Threshold (Engine Default: 0.80)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.2"
              max="0.99"
              className="input mono"
              value={collusionThreshold}
              onChange={(e) => setCollusionThreshold(Number(e.target.value))}
            />
          </div>
          <div className="mono text-muted" style={{ fontSize: "11px" }}>
            Formula fixed in engine: Combined = 0.35 × Winnowing + 0.65 × Greedy String Tiling.
          </div>
        </div>
      </div>
    </div>
  );
};
