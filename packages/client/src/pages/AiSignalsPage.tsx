import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../store/auth";
import {
  AiVerdictBadge,
  EmptyCohortState,
  ErrorStatePanel,
  ScreenSkeleton,
} from "../components/StatePrimitives";
import { AiSignalFlags } from "../types/zixie";

const READABLE_FLAG_DEFINITIONS: Array<{
  key: keyof AiSignalFlags;
  label: string;
  description: string;
}> = [
  {
    key: "verboseDocstrings",
    label: "Verbose Docstrings",
    description: "Multi-line or restating parameter docstrings disproportionate to function size",
  },
  {
    key: "uniformCommentDensity",
    label: "Uniform Comment Density",
    description: "Step-by-step inline comments evenly distributed across basic control flow",
  },
  {
    key: "canonicalNamingPattern",
    label: "Canonical Identifier Naming",
    description: "Textbook camelCase/snake_case identifiers matching common tutorial solutions",
  },
  {
    key: "lowEntropyFormatting",
    label: "Low-Entropy Formatting",
    description: "Zero whitespace variance and uniform block spacing throughout the file",
  },
  {
    key: "standardAiBoilerplate",
    label: "Standard Template Boilerplate",
    description: "Includes canonical guard clauses or example harness patterns",
  },
];

export const AiSignalsPage: React.FC = () => {
  const { activePayload, reportLoading, reportError, loadDemoCohort } = useWorkspace();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "FLAGGED" | "HUMAN_LIKELY">("ALL");

  const sortedSignals = useMemo(() => {
    if (!activePayload) return [];
    const candidateMap = new Map(activePayload.candidates.map((c) => [c.id, c]));

    return [...activePayload.report.aiResults]
      .filter((item) => {
        if (statusFilter === "FLAGGED") return item.verdict !== "HUMAN_LIKELY";
        if (statusFilter === "HUMAN_LIKELY") return item.verdict === "HUMAN_LIKELY";
        return true;
      })
      .sort((a, b) => b.aiProbability - a.aiProbability)
      .map((signal) => ({
        signal,
        candidate: candidateMap.get(signal.candidateId),
      }));
  }, [activePayload, statusFilter]);

  if (reportLoading) {
    return <ScreenSkeleton label="Loading heuristic AI signals..." />;
  }

  if (reportError) {
    return (
      <ErrorStatePanel
        title="Could not load heuristic AI signals"
        message={reportError}
        onRetry={loadDemoCohort}
      />
    );
  }

  if (!activePayload) {
    return (
      <EmptyCohortState
        onLoadDemo={loadDemoCohort}
        onGoUpload={() => navigate("/submissions?upload=1")}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Heuristic AI Writing Signals
          </h1>
          <p className="text-secondary" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
            Static code style indicators sorted by heuristic probability.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }} role="tablist" aria-label="Filter AI signals">
          {(["ALL", "FLAGGED", "HUMAN_LIKELY"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={statusFilter === mode}
              className={`btn ${statusFilter === mode ? "btn--primary" : ""}`} onClick={() => setStatusFilter(mode)} > {mode === "ALL" ? "All Candidates" : mode === "FLAGGED" ? "Flagged Only" : "Human Likely"} </button> ))} </div> </div>  <div className="panel" style={{ borderLeft: "3px solid var(--accent)", background: "var(--bg-surface)", }} > <div className="panel-body"> <div className="mono" style={{ fontWeight: 600, marginBottom: "4px" }}> [METHODOLOGY DISCLOSURE: DETERMINISTIC HEURISTIC — NOT A TRAINED ML MODEL] </div> <p className="text-secondary" style={{ margin: 0 }}> These scores are computed by rule-based heuristics in <code className="mono">packages/engine</code>{" "} that inspect comment density, docstring verbosity, identifier regularity, and formatting entropy. Well-formatted human code or IDE auto-formatters can trigger these indicators. Use these signals solely as context during an academic review conversation — never as standalone proof. </p> </div> </div>  <section className="panel" aria-label="Candidate heuristic AI signal list"> <div className="table-wrap"> <table className="data-table"> <thead> <tr> <th>Candidate</th> <th>Heuristic Score</th> <th>Signal Status</th> <th>Triggered Indicator Flags</th> <th>Heuristic Reasons</th> <th>Dossier</th> </tr> </thead> <tbody> {sortedSignals.length === 0 ? ( <tr> <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}> No records match the selected filter. </td> </tr> ) : ( sortedSignals.map(({ signal, candidate }) => { const activeFlags = READABLE_FLAG_DEFINITIONS.filter( (def) => signal.flags && signal.flags[def.key] );  return ( <tr key={signal.candidateId}> <td> <strong>{candidate?.candidateName || signal.candidateId}</strong> <div className="mono text-muted" style={{ fontSize: "11px" }}> {candidate?.filename} ({candidate?.language}) </div> </td> <td className="mono" style={{ fontWeight: 600, fontSize: "13px" }}> {(signal.aiProbability * 100).toFixed(0)}% </td> <td> <AiVerdictBadge verdict={signal.verdict} /> </td> <td> {activeFlags.length === 0 ? ( <span className="text-muted">None triggered</span> ) : ( <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}> {activeFlags.map((flag) => ( <span key={flag.key} className="status-badge status-badge--neutral" title={flag.description} > {flag.label} </span> ))} </div> )} </td> <td style={{ maxWidth: "360px" }}> {signal.reasons.length === 0 ? ( <span className="text-muted">No anomalous patterns noted.</span> ) : ( <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px" }}> {signal.reasons.map((reason, idx) => ( <li key={idx}>{reason}</li> ))} </ul> )} </td> <td> <button type="button" className="btn" onClick={() => navigate( `/submissions?candidate=${encodeURIComponent(signal.candidateId)}`
                            )
                          }
                        >
                          Inspect Code
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
