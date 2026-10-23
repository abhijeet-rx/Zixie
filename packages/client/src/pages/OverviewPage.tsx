import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../store/auth";
import {
  AiVerdictBadge,
  EmptyCohortState,
  ErrorStatePanel,
  PairVerdictBadge,
  ScreenSkeleton,
} from "../components/StatePrimitives";

export const OverviewPage: React.FC = () => {
  const { activePayload, reportLoading, reportError, loadDemoCohort, isPreviewMode } = useWorkspace();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    if (!activePayload) return null;
    const { candidates, report } = activePayload;

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    const flaggedCandidateIds = new Set<string>();
    report.pairResults.forEach((p) => {
      if (p.verdict !== "CLEAR") {
        flaggedCandidateIds.add(p.candidateAId);
        flaggedCandidateIds.add(p.candidateBId);
      }
    });
    report.aiResults.forEach((a) => {
      if (a.verdict !== "HUMAN_LIKELY") {
        flaggedCandidateIds.add(a.candidateId);
      }
    });
    report.clusters.forEach((c) => {
      c.candidateIds.forEach((id) => flaggedCandidateIds.add(id));
    });

    const aiSignalCount = report.aiResults.filter((a) => a.verdict !== "HUMAN_LIKELY").length;

    const priorityPairs = [...report.pairResults]
      .filter((p) => p.verdict !== "CLEAR")
      .sort((a, b) => b.similarityScore - a.similarityScore);

    const priorityAi = [...report.aiResults]
      .filter((a) => a.verdict !== "HUMAN_LIKELY")
      .sort((a, b) => b.aiProbability - a.aiProbability);

    return {
      totalSubmissions: candidates.length,
      totalComparisons: report.pairResults.length,
      needingAttentionCount: flaggedCandidateIds.size,
      clusterCount: report.clusters.length,
      aiSignalCount,
      priorityPairs,
      priorityAi,
      candidateMap,
    };
  }, [activePayload]);

  if (reportLoading) {
    return <ScreenSkeleton label="Loading cohort overview..." />;
  }

  if (reportError) {
    return (
      <ErrorStatePanel
        title="Could not load cohort overview"
        message={reportError}
        onRetry={loadDemoCohort}
      />
    );
  }

  if (!activePayload || !metrics) {
    return (
      <EmptyCohortState
        onLoadDemo={loadDemoCohort}
        onGoUpload={() => navigate("/submissions?upload=1")}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Cohort Triage Overview</h1>
          <p className="text-secondary" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
            {isPreviewMode
              ? "Displaying a local sample cohort for interface preview. No account or database is being used."
              : activePayload.source === "demo"
              ? "Displaying sample cohort returned by GET /api/demo. Upload a batch to analyze live student submissions."
              : `Displaying persisted report ${activePayload.reportId} (${metrics.totalComparisons} pairwise comparisons).`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/reports")}
          >
            Export CSV / JSON
          </button>
        </div>
      </div>

      <section aria-label="Cohort key metrics" className="kpi-grid">
        <button
          type="button"
          className="kpi-card"
          onClick={() => navigate("/submissions")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span className="text-secondary" style={{ fontSize: "12px", fontWeight: 500 }}>
              Submissions Analyzed
            </span>
            <span className="mono text-muted" style={{ fontSize: "11px" }}>
              /submissions →
            </span>
          </div>
          <div className="kpi-value">{metrics.totalSubmissions}</div>
          <div className="mono text-muted" style={{ fontSize: "11px" }}>
            {metrics.totalComparisons} pairwise comparisons
          </div>
        </button>

        <button
          type="button"
          className="kpi-card"
          onClick={() => navigate("/submissions?filter=attention")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span className="text-secondary" style={{ fontSize: "12px", fontWeight: 500 }}>
              Candidates Needing Attention
            </span>
            <span className="mono text-muted" style={{ fontSize: "11px" }}>
              ?filter=attention →
            </span>
          </div>
          <div
            className="kpi-value"
            style={{
              color:
                metrics.needingAttentionCount > 0
                  ? "var(--risk-suspicious-fg)"
                  : "var(--text-primary)",
            }}
          >
            {metrics.needingAttentionCount}
          </div>
          <div className="mono text-muted" style={{ fontSize: "11px" }}>
            Flagged by pair score, cluster, or heuristic
          </div>
        </button>

        <button
          type="button"
          className="kpi-card"
          onClick={() => navigate("/similarity")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span className="text-secondary" style={{ fontSize: "12px", fontWeight: 500 }}>
              Collusion Clusters
            </span>
            <span className="mono text-muted" style={{ fontSize: "11px" }}>
              /similarity →
            </span>
          </div>
          <div
            className="kpi-value"
            style={{
              color:
                metrics.clusterCount > 0 ? "var(--risk-collusion-fg)" : "var(--text-primary)",
            }}
          >
            {metrics.clusterCount}
          </div>
          <div className="mono text-muted" style={{ fontSize: "11px" }}>
            Connected candidate subgraphs (join ≥ 0.70)
          </div>
        </button>

        <button
          type="button"
          className="kpi-card"
          onClick={() => navigate("/ai-detection")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span className="text-secondary" style={{ fontSize: "12px", fontWeight: 500 }}>
              AI Signals
            </span>
            <span className="mono text-muted" style={{ fontSize: "11px" }}>
              /ai-detection →
            </span>
          </div>
          <div
            className="kpi-value"
            style={{
              color:
                metrics.aiSignalCount > 0 ? "var(--risk-suspicious-fg)" : "var(--text-primary)",
            }}
          >
            {metrics.aiSignalCount}
          </div>
          <div className="mono text-muted" style={{ fontSize: "11px" }}>
            Heuristic structural signals (non-ML)
          </div>
        </button>
      </section>

      <section className="panel" aria-label="Priority review queue">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Priority Review Queue</h2>
            <p className="text-muted" style={{ margin: "2px 0 0 0", fontSize: "11px" }}>
              All flags are leads requiring human verification of source code and matched token tiles.
            </p>
          </div>
          <span className="mono text-muted" style={{ fontSize: "11px" }}>
            {metrics.priorityPairs.length} pair flags • {metrics.priorityAi.length} AI signal flags
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Queue Type</th>
                <th>Subject(s)</th>
                <th>Primary Score</th>
                <th>Evidence Breakdown</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics.priorityPairs.length === 0 && metrics.priorityAi.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    No pairs or candidates crossed the review thresholds in this cohort.
                  </td>
                </tr>
              )}

              {metrics.priorityPairs.map((pair) => {
                const candA = metrics.candidateMap.get(pair.candidateAId);
                const candB = pair.candidateBId
                  ? metrics.candidateMap.get(pair.candidateBId)
                  : undefined;

                return (
                  <tr key={`pair-${pair.candidateAId}-${pair.candidateBId}`}> <td className="mono">PAIR SIMILARITY</td> <td> <strong>{candA?.candidateName || pair.candidateAId}</strong> <span className="text-muted"> vs </span> <strong>{candB?.candidateName || pair.candidateBId}</strong> <div className="mono text-muted" style={{ fontSize: "11px" }}> {candA?.filename} ↔ {candB?.filename} </div> </td> <td className="mono" style={{ fontWeight: 600 }}> {(pair.similarityScore * 100).toFixed(1)}% </td> <td className="mono text-secondary" style={{ fontSize: "11px" }}> Winnowing: {(pair.winnowingScore * 100).toFixed(1)}% • Tiling:{" "} {(pair.tilingScore * 100).toFixed(1)}% • {pair.matchedTiles.length} tiles </td> <td> <PairVerdictBadge verdict={pair.verdict} /> </td> <td> <button type="button" className="btn" onClick={() => navigate( `/similarity?pair=${encodeURIComponent(
                              `${pair.candidateAId}:${pair.candidateBId}`
                            )}`
                          )
                        }
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                );
              })}

              {metrics.priorityAi.map((ai) => {
                const cand = metrics.candidateMap.get(ai.candidateId);
                return (
                  <tr key={`ai-${ai.candidateId}`}> <td className="mono">AI HEURISTIC</td> <td> <strong>{cand?.candidateName || ai.candidateId}</strong> <div className="mono text-muted" style={{ fontSize: "11px" }}> {cand?.filename} </div> </td> <td className="mono" style={{ fontWeight: 600 }}> {(ai.aiProbability * 100).toFixed(0)}% heuristic </td> <td className="text-secondary" style={{ fontSize: "11px" }}> {ai.reasons[0] || "Structural heuristic indicator triggered"} </td> <td> <AiVerdictBadge verdict={ai.verdict} /> </td> <td> <button type="button" className="btn" onClick={() => navigate(`/submissions?candidate=${encodeURIComponent(ai.candidateId)}`)
                        }
                      >
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
