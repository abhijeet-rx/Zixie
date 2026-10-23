import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../store/auth";
import {
  EmptyCohortState,
  ErrorStatePanel,
  ScreenSkeleton,
} from "../components/StatePrimitives";

function triggerBrowserDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const ReportsPage: React.FC = () => {
  const {
    activePayload,
    reportLoading,
    reportError,
    loadDemoCohort,
    loadReportById,
    isPreviewMode,
  } = useWorkspace();
  const navigate = useNavigate();

  const [lookupId, setLookupId] = useState("");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  if (reportLoading) {
    return <ScreenSkeleton label="Loading report metadata..." />;
  }

  const handleLoadOwnedReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupMessage(null);
    try {
      await loadReportById(lookupId.trim());
      setLookupMessage(`Loaded report ${lookupId.trim()} owned by current user.`);
      setLookupId("");
    } catch {
      // Error surfaced by workspace state
    }
  };

  if (!activePayload) {
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        {reportError && (
          <ErrorStatePanel
            title="Report retrieval failed"
            message={reportError}
            onRetry={loadDemoCohort}
          />
        )}
        <EmptyCohortState
          onLoadDemo={loadDemoCohort}
          onGoUpload={() => navigate("/submissions?upload=1")}
        />
      </div>
    );
  }

  const { reportId, candidates, report, source } = activePayload;
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const collusionPairs = report.pairResults.filter((p) => p.verdict === "COLLUSION_DETECTED");
  const suspiciousPairs = report.pairResults.filter((p) => p.verdict === "SUSPICIOUS");
  const flaggedAi = report.aiResults.filter((a) => a.verdict !== "HUMAN_LIKELY");

  const handleExportJson = () => {
    const payload = {
      reportId,
      source,
      exportedAt: new Date().toISOString(),
      summary: {
        candidateCount: candidates.length,
        pairComparisonsCount: report.pairResults.length,
        collusionPairsCount: collusionPairs.length,
        suspiciousPairsCount: suspiciousPairs.length,
        clusterCount: report.clusters.length,
        aiSignalsFlaggedCount: flaggedAi.length,
      },
      candidates,
      report,
    };
    const filename = `zixie-report-${reportId}-${Date.now()}.json`;
    triggerBrowserDownload(filename, JSON.stringify(payload, null, 2), "application/json");
    setExportStatus(`Downloaded ${filename} (JSON)`); };  const handleExportCsv = () => { const headers = [ "report_id", "candidate_a_id", "candidate_a_name", "candidate_a_file", "candidate_b_id", "candidate_b_name", "candidate_b_file", "combined_similarity", "winnowing_score", "tiling_score", "matched_tiles_count", "pair_verdict", ];  const escapeCsv = (val: string | number) => { const str = String(val ?? ""); if (str.includes(",") || str.includes('"') || str.includes("\n")) { return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = report.pairResults.map((pair) => {
      const candA = candidateMap.get(pair.candidateAId);
      const candB = candidateMap.get(pair.candidateBId);
      return [
        reportId,
        pair.candidateAId,
        candA?.candidateName || "",
        candA?.filename || "",
        pair.candidateBId,
        candB?.candidateName || "",
        candB?.filename || "",
        pair.similarityScore.toFixed(3),
        pair.winnowingScore.toFixed(3),
        pair.tilingScore.toFixed(3),
        pair.matchedTiles.length,
        pair.verdict,
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `zixie-pairs-${reportId}-${Date.now()}.csv`;
    triggerBrowserDownload(filename, csvContent, "text/csv;charset=utf-8;");
    setExportStatus(`Downloaded ${filename} (CSV)`); };  return ( <div style={{ display: "grid", gap: "18px" }}> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", }} > <div> <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}> Report Summary & Evidence Export </h1> <p className="text-secondary" style={{ margin: "2px 0 0 0", fontSize: "12px" }}> Export the active cohort analysis as structured CSV or full forensic JSON. </p> </div>  <div style={{ display: "flex", gap: "8px" }}> <button type="button" className="btn" onClick={handleExportCsv}> Download CSV Report </button> <button type="button" className="btn btn--primary" onClick={handleExportJson}> Download JSON Report </button> </div> </div>  {exportStatus && ( <div role="status" className="panel" style={{ padding: "10px 14px", borderColor: "var(--risk-clear-border)", color: "var(--risk-clear-fg)", }} > <span className="mono">[EXPORT COMPLETE] {exportStatus}</span> </div> )}  {reportError && ( <ErrorStatePanel title="Report lookup error" message={reportError} /> )}  <section className="panel" aria-label="Active report metadata"> <div className="panel-header"> <h2 className="panel-title">Active Report Metadata</h2> <span className="mono text-muted" style={{ fontSize: "11px" }}> Source: {isPreviewMode ? "Local browser preview" : source === "demo" ? "GET /api/demo" : "Persisted Owner Report"} </span> </div> <div className="panel-body"> <div className="table-wrap"> <table className="data-table"> <tbody> <tr> <th style={{ width: "240px" }}>Report Identifier</th> <td className="mono">{reportId}</td> </tr> <tr> <th>Candidates Evaluated</th> <td className="mono">{candidates.length}</td> </tr> <tr> <th>Total Pairwise Comparisons</th> <td className="mono"> {report.pairResults.length} (N × (N − 1) / 2) </td> </tr> <tr> <th>Flagged Pair Comparisons</th> <td className="mono"> {collusionPairs.length + suspiciousPairs.length} total ( {collusionPairs.length} collusion ≥ 0.80, {suspiciousPairs.length} suspicious ≥ 0.55) </td> </tr> <tr> <th>Collusion Clusters</th> <td className="mono">{report.clusters.length}</td> </tr> <tr> <th>Heuristic AI Signals Flagged</th> <td className="mono">{flaggedAi.length}</td> </tr> </tbody> </table> </div> </div> </section>  <section className="panel" aria-label="Load owned report by ID"> <div className="panel-header"> <h2 className="panel-title">Retrieve Persisted Report by ID (GET /api/reports/:id)</h2> <span className="mono text-muted" style={{ fontSize: "11px" }}> Owner-scoped only • No server list endpoint exists </span> </div> <div className="panel-body"> <p className="text-secondary" style={{ marginTop: 0 }}> The backend persists analyzed batches in MongoDB and retrieves them individually by Report ID for the authenticated owner. It does not expose a historical report list API. </p> <form onSubmit={handleLoadOwnedReport} style={{ display: "flex", gap: "8px", maxWidth: "480px" }} > <input type="text" className="input mono" placeholder="Enter owned MongoDB Report ID..." value={lookupId} onChange={(e) => setLookupId(e.target.value)} aria-label="Report ID" /> <button type="submit" className="btn btn--primary" disabled={!lookupId.trim() || isPreviewMode}> Load Report </button> </form> {lookupMessage && ( <div className="mono text-secondary" style={{ marginTop: "8px", fontSize: "11px" }}> {lookupMessage} </div> )} </div> </section> </div> ); };
