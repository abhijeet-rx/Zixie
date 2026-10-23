import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "../store/auth";
import {
  AiVerdictBadge,
  EmptyCohortState,
  ErrorStatePanel,
  PairVerdictBadge,
  ScreenSkeleton,
} from "../components/StatePrimitives";
import { UPLOAD_FIELD_NAME } from "../api/client";

const SUPPORTED_EXTENSIONS = [
  ".zip",
  ".py",
  ".java",
  ".cpp",
  ".cc",
  ".c",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

const AI_FLAG_LABELS: Record<string, string> = {
  verboseDocstrings: "Verbose Docstrings",
  uniformCommentDensity: "Uniform Comment Density",
  canonicalNamingPattern: "Canonical Identifier Naming",
  lowEntropyFormatting: "Low-Entropy Formatting",
  standardAiBoilerplate: "Standard Template Boilerplate",
};

export const SubmissionsPage: React.FC = () => {
  const { activePayload, reportLoading, reportError, loadDemoCohort, uploadAndAnalyze, isPreviewMode } =
    useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filterParam = searchParams.get("filter") === "attention" ? "attention" : "all";
  const initialSearch = searchParams.get("q") || "";
  const candidateParam = searchParams.get("candidate");

  const [filterMode, setFilterMode] = useState<"all" | "attention" | "clean">(filterParam);
  const [sortBy, setSortBy] = useState<"risk" | "similarity" | "name">("risk");
  const [searchText, setSearchText] = useState(initialSearch);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(candidateParam);
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(Boolean(candidateParam));

  const [showUploadBox, setShowUploadBox] = useState<boolean>(searchParams.get("upload") === "1");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "attention" || f === "clean" || f === "all") {
      setFilterMode(f);
    }
    const c = searchParams.get("candidate");
    if (c) {
      setSelectedCandidateId(c);
      setMobileShowDetail(true);
    }
  }, [searchParams]);

  const enrichedCandidates = useMemo(() => {
    if (!activePayload) return [];
    const { candidates, report } = activePayload;
    const candidateById = new Map(candidates.map((c) => [c.id, c]));

    return candidates.map((cand) => {
      const pairsForCand = report.pairResults.filter(
        (p) => p.candidateAId === cand.id || p.candidateBId === cand.id
      );
      const topPair = [...pairsForCand].sort((a, b) => b.similarityScore - a.similarityScore)[0];
      const partnerId = topPair
        ? topPair.candidateAId === cand.id
          ? topPair.candidateBId
          : topPair.candidateAId
        : null;
      const partner = partnerId ? candidateById.get(partnerId) : undefined;

      const aiSignal = report.aiResults.find((a) => a.candidateId === cand.id);
      const cluster = report.clusters.find((cl) => cl.candidateIds.includes(cand.id));

      const maxSim = topPair?.similarityScore ?? 0;
      const needsAttention =
        (topPair && topPair.verdict !== "CLEAR") ||
        (aiSignal && aiSignal.verdict !== "HUMAN_LIKELY") ||
        Boolean(cluster);

      const riskRank =
        topPair?.verdict === "COLLUSION_DETECTED" || Boolean(cluster)
          ? 3
          : topPair?.verdict === "SUSPICIOUS" || aiSignal?.verdict === "AI_GENERATED_LIKELY"
          ? 2
          : aiSignal?.verdict === "SUSPICIOUS"
          ? 1
          : 0;

      const matchedLines = new Set<number>();
      if (topPair) {
        const isSource = topPair.candidateAId === cand.id;
        topPair.matchedTiles.forEach((tile) => {
          const start = isSource ? tile.sourceStartLine : tile.targetStartLine;
          const end = isSource ? tile.sourceEndLine : tile.targetEndLine;
          for (let line = start; line <= end; line += 1) {
            matchedLines.add(line);
          }
        });
      }

      return {
        candidate: cand,
        topPair,
        partner,
        aiSignal,
        cluster,
        maxSim,
        needsAttention,
        riskRank,
        matchedLines,
      };
    });
  }, [activePayload]);

  const filteredCandidates = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return enrichedCandidates
      .filter((item) => {
        if (filterMode === "attention" && !item.needsAttention) return false;
        if (filterMode === "clean" && item.needsAttention) return false;
        if (!q) return true;
        return (
          item.candidate.candidateName.toLowerCase().includes(q) ||
          item.candidate.filename.toLowerCase().includes(q) ||
          item.candidate.language.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "risk") {
          if (b.riskRank !== a.riskRank) return b.riskRank - a.riskRank;
          return b.maxSim - a.maxSim;
        }
        if (sortBy === "similarity") {
          return b.maxSim - a.maxSim;
        }
        return a.candidate.candidateName.localeCompare(b.candidate.candidateName);
      });
  }, [enrichedCandidates, filterMode, searchText, sortBy]);

  useEffect(() => {
    if (
      filteredCandidates.length > 0 &&
      (!selectedCandidateId ||
        !filteredCandidates.some((c) => c.candidate.id === selectedCandidateId))
    ) {
      setSelectedCandidateId(filteredCandidates[0].candidate.id);
    }
  }, [filteredCandidates, selectedCandidateId]);

  const selectedEntry = useMemo(
    () => enrichedCandidates.find((c) => c.candidate.id === selectedCandidateId) ?? null,
    [enrichedCandidates, selectedCandidateId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadFeedback(null);
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const invalid = fileList.filter((file) => {
      const lower = file.name.toLowerCase();
      return !SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    });

    if (invalid.length > 0) {
      setUploadError(
        `Unsupported file format: ${invalid.map((f) => f.name).join(", ")}. Supported formats aligned with server extractor: ${SUPPORTED_EXTENSIONS.join(", ")}.` ); setSelectedFiles([]); return; }  setSelectedFiles(fileList); };  const handleBatchUpload = async (e: React.FormEvent) => { e.preventDefault(); if (selectedFiles.length === 0) { setUploadError("Select at least two source files or a .zip archive before analyzing."); return; } setUploading(true); setUploadError(null); setUploadFeedback(null); try { const result = await uploadAndAnalyze(selectedFiles); setUploadFeedback( `Analyzed ${result.candidates.length} submissions into report ${result.reportId}.` ); setSelectedFiles([]); } catch (err) { setUploadError(err instanceof Error ? err.message : "Failed to analyze uploaded batch."); } finally { setUploading(false); } };  if (reportLoading && !uploading) { return <ScreenSkeleton label="Loading candidate submissions..." />; }  return ( <div style={{ display: "grid", gap: "16px" }}> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", }} > <div> <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}> Submissions & Candidate Dossier </h1> <p className="text-secondary" style={{ margin: "2px 0 0 0", fontSize: "12px" }}> Inspect source submissions, highest-similarity partners, matched lines, and heuristic AI signals. </p> </div>  <button type="button" className="btn btn--primary" onClick={() => setShowUploadBox((prev) => !prev)} > {showUploadBox ? "Hide Batch Uploader" : "Upload Submission Batch"} </button> </div>  {showUploadBox && ( <section className="panel" aria-label="Upload submission batch"> <div className="panel-header"> <h2 className="panel-title">Batch Upload (POST /api/analyze)</h2> <span className="mono text-muted" style={{ fontSize: "11px" }}> multipart/form-data • field="{UPLOAD_FIELD_NAME}" </span> </div> <div className="panel-body"> <form onSubmit={handleBatchUpload} style={{ display: "grid", gap: "12px" }}> <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", }} > <input type="file" multiple accept={SUPPORTED_EXTENSIONS.join(",")} onChange={handleFileChange} aria-label="Select submission source files or ZIP archive" /> <button type="submit" className="btn btn--primary" disabled={uploading || selectedFiles.length === 0 || isPreviewMode} > {uploading ? "Analyzing Batch..." : isPreviewMode ? "Unavailable in preview" : "Run Cohort Analysis"} </button> </div> <div className="mono text-muted" style={{ fontSize: "11px" }}> Accepted formats (server-aligned): {SUPPORTED_EXTENSIONS.join(", ")} </div> {selectedFiles.length > 0 && ( <div className="mono text-secondary" style={{ fontSize: "11px" }}> Selected ({selectedFiles.length}): {selectedFiles.map((f) => f.name).join(", ")} </div> )} {uploadError && ( <div role="alert" className="mono" style={{ color: "var(--risk-collusion-fg)", fontSize: "12px" }} > [UPLOAD ERROR] {uploadError} </div> )} {uploadFeedback && ( <div role="status" className="mono" style={{ color: "var(--risk-clear-fg)", fontSize: "12px" }} > [COMPLETE] {uploadFeedback} </div> )} </form> </div> </section> )}  {reportError && ( <ErrorStatePanel title="Submissions load error" message={reportError} onRetry={loadDemoCohort} /> )}  {!activePayload ? ( <EmptyCohortState onLoadDemo={loadDemoCohort} onGoUpload={() => setShowUploadBox(true)} /> ) : ( <div className="split-workspace"> <section className="panel" aria-label="Candidate list" style={{ display: mobileShowDetail && window.innerWidth <= 960 ? "none" : "block", }} > <div className="panel-header" style={{ flexDirection: "column", alignItems: "stretch" }}> <input type="search" className="input" placeholder="Search name, filename, or language..." value={searchText} onChange={(e) => setSearchText(e.target.value)} aria-label="Filter candidates by name or filename" />  <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", marginTop: "8px", }} > <div style={{ display: "flex", gap: "4px" }} role="tablist" aria-label="Filter mode"> {(["all", "attention", "clean"] as const).map((mode) => ( <button key={mode} type="button" role="tab" aria-selected={filterMode === mode} className={`btn ${filterMode === mode ? "btn--primary" : ""}`}
                      style={{ height: "26px", padding: "0 8px", fontSize: "11px" }}
                      onClick={() => {
                        setFilterMode(mode);
                        setSearchParams(mode === "all" ? {} : { filter: mode });
                      }}
                    >
                      {mode === "all" ? "All" : mode === "attention" ? "Attention" : "Clean"}
                    </button>
                  ))}
                </div>

                <select
                  className="select"
                  style={{ width: "auto", height: "26px", fontSize: "11px" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "risk" | "similarity" | "name")}
                  aria-label="Sort candidates"
                >
                  <option value="risk">Sort: Risk</option>
                  <option value="similarity">Sort: Peak Similarity</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            <div style={{ maxHeight: "640px", overflowY: "auto" }}>
              {filteredCandidates.length === 0 ? (
                <div className="panel-body text-secondary" style={{ textAlign: "center" }}>
                  No candidates match the current filter criteria.
                </div>
              ) : (
                filteredCandidates.map((item) => {
                  const isSelected = item.candidate.id === selectedEntry?.candidate.id;
                  return (
                    <button
                      key={item.candidate.id}
                      type="button"
                      onClick={() => {
                        setSelectedCandidateId(item.candidate.id);
                        setMobileShowDetail(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        border: "none",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: isSelected ? "var(--bg-active)" : "transparent",
                        borderLeft: isSelected
                          ? "3px solid var(--accent)"
                          : "3px solid transparent",
                        cursor: "pointer",
                        display: "grid",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        <strong style={{ fontSize: "13px" }}>
                          {item.candidate.candidateName}
                        </strong>
                        <span className="mono" style={{ fontSize: "12px", fontWeight: 600 }}>
                          {(item.maxSim * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="mono text-muted"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                        }}
                      >
                        <span>
                          {item.candidate.filename} ({item.candidate.language})
                        </span>
                        <span>
                          {item.needsAttention ? "[NEEDS REVIEW]" : "[CLEAR]"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="panel" aria-label="Selected candidate dossier">
            {!selectedEntry ? (
              <div className="panel-body text-secondary">
                Select a candidate from the list to view their source dossier.
              </div>
            ) : (
              <>
                <div className="panel-header" style={{ flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setMobileShowDetail(false)}
                      style={{ display: window.innerWidth <= 960 ? "inline-flex" : "none" }}
                    >
                      ← Back to List
                    </button>
                    <div>
                      <h2 className="panel-title" style={{ fontSize: "15px" }}>
                        {selectedEntry.candidate.candidateName}
                      </h2>
                      <div className="mono text-muted" style={{ fontSize: "11px" }}>
                        {selectedEntry.candidate.filename} • {selectedEntry.candidate.language} •{" "}
                        {selectedEntry.candidate.sourceCode.split("\n").length} lines
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedEntry.topPair && (
                      <PairVerdictBadge verdict={selectedEntry.topPair.verdict} />
                    )}
                    {selectedEntry.aiSignal && (
                      <AiVerdictBadge verdict={selectedEntry.aiSignal.verdict} />
                    )}
                  </div>
                </div>

                <div className="panel-body" style={{ display: "grid", gap: "16px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div className="mono text-muted" style={{ fontSize: "11px" }}>
                        CLOSEST STRUCTURAL PARTNER
                      </div>
                      {selectedEntry.topPair ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                              margin: "6px 0",
                            }}
                          >
                            <strong>
                              {selectedEntry.partner?.candidateName ||
                                selectedEntry.topPair.candidateBId}
                            </strong>
                            <span className="mono" style={{ fontSize: "16px", fontWeight: 600 }}>
                              {(selectedEntry.topPair.similarityScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="mono text-secondary" style={{ fontSize: "11px" }}>
                            Winnowing: {(selectedEntry.topPair.winnowingScore * 100).toFixed(1)}% •
                            Tiling: {(selectedEntry.topPair.tilingScore * 100).toFixed(1)}% •{" "}
                            {selectedEntry.topPair.matchedTiles.length} tiles
                          </div>
                          <button
                            type="button"
                            className="btn btn--primary"
                            style={{ marginTop: "10px", width: "100%" }}
                            onClick={() =>
                              navigate(
                                `/similarity?pair=${encodeURIComponent( `${selectedEntry.topPair!.candidateAId}:${selectedEntry.topPair!.candidateBId}` )}` ) } > Compare Pair Side-by-Side </button> </> ) : ( <div className="text-muted" style={{ marginTop: "6px" }}> No pair comparisons recorded. </div> )} </div>  <div style={{ padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", }} > <div className="mono text-muted" style={{ fontSize: "11px" }}> HEURISTIC AI SIGNAL (NON-ML) </div> {selectedEntry.aiSignal ? ( <> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "6px 0", }} > <span>Heuristic Probability</span> <span className="mono" style={{ fontSize: "16px", fontWeight: 600 }}> {(selectedEntry.aiSignal.aiProbability * 100).toFixed(0)}% </span> </div> <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}> {Object.entries(selectedEntry.aiSignal.flags) .filter(([, active]) => active) .map(([flagKey]) => ( <span key={flagKey} className="status-badge status-badge--neutral" style={{ fontSize: "10px" }} > {AI_FLAG_LABELS[flagKey] || flagKey} </span> ))} </div> </> ) : ( <div className="text-muted" style={{ marginTop: "6px" }}> No heuristic AI signal data. </div> )} </div>  <div style={{ padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", }} > <div className="mono text-muted" style={{ fontSize: "11px" }}> COLLUSION CLUSTER LEAD </div> {selectedEntry.cluster ? ( <> <div style={{ margin: "6px 0", fontWeight: 600 }}> Cluster {selectedEntry.cluster.id} ( {selectedEntry.cluster.candidateIds.length} members) </div> <div className="mono text-secondary" style={{ fontSize: "11px" }}> Peak similarity:{" "} {(selectedEntry.cluster.maxSimilarity * 100).toFixed(1)}% </div> </> ) : ( <div className="text-muted" style={{ marginTop: "6px" }}> Not linked to any multi-candidate cluster (join threshold ≥ 0.70). </div> )} </div> </div>  <div> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", }} > <span className="mono" style={{ fontSize: "12px", fontWeight: 600 }}> SOURCE CODE ({selectedEntry.candidate.filename}) </span> <span className="mono text-muted" style={{ fontSize: "11px" }}> Highlighted lines indicate token runs matched with closest partner </span> </div>  <div className="code-viewer" role="region" aria-label="Candidate source code"> {selectedEntry.candidate.sourceCode.split("\n").map((lineText, idx) => { const lineNum = idx + 1; const isMatched = selectedEntry.matchedLines.has(lineNum); return ( <div key={lineNum} className={`code-line ${isMatched ? "code-line--matched" : ""}`}
                          >
                            <span className="code-gutter">{lineNum}</span>
                            <span>{lineText || " "}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
