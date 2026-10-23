import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "../store/auth";
import { apiClient } from "../api/client";
import { MatchedTile, PairSimilarityResult } from "../types/zixie";
import {
  EmptyCohortState,
  ErrorStatePanel,
  PairVerdictBadge,
  ScreenSkeleton,
} from "../components/StatePrimitives";

export const SimilarityPage: React.FC = () => {
  const { activePayload, reportLoading, reportError, loadDemoCohort } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"matrix" | "table">("matrix");
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(searchParams.get("pair"));
  const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);
  const [livePairOverride, setLivePairOverride] = useState<PairSimilarityResult | null>(null);

  const pairLookup = useMemo(() => {
    const map = new Map<string, PairSimilarityResult>();
    if (!activePayload) return map;
    activePayload.report.pairResults.forEach((p) => {
      map.set(`${p.candidateAId}:${p.candidateBId}`, p);
      map.set(`${p.candidateBId}:${p.candidateAId}`, {
        ...p,
        candidateAId: p.candidateBId,
        candidateBId: p.candidateAId,
        matchedTiles: p.matchedTiles.map((t) => ({
          sourceStartLine: t.targetStartLine,
          sourceEndLine: t.targetEndLine,
          targetStartLine: t.sourceStartLine,
          targetEndLine: t.sourceEndLine,
          tokenCount: t.tokenCount,
        })),
      });
    });
    return map;
  }, [activePayload]);

  useEffect(() => {
    if (!activePayload) return;
    const paramPair = searchParams.get("pair");
    if (paramPair && pairLookup.has(paramPair)) {
      setSelectedPairKey(paramPair);
      return;
    }
    if (!selectedPairKey && activePayload.report.pairResults.length > 0) {
      const top = [...activePayload.report.pairResults].sort(
        (a, b) => b.similarityScore - a.similarityScore
      )[0];
      setSelectedPairKey(`${top.candidateAId}:${top.candidateBId}`);
    }
  }, [activePayload, pairLookup, searchParams, selectedPairKey]);

  useEffect(() => {
    setLivePairOverride(null);
    setActiveTileIndex(null);
    if (!activePayload || activePayload.source !== "live" || !selectedPairKey) return;
    const [candA, candB] = selectedPairKey.split(":");
    if (!candA || !candB) return;

    let cancelled = false;
    apiClient
      .compareCandidates(activePayload.reportId, candA, candB)
      .then((res) => {
        if (!cancelled && res && typeof res.similarityScore === "number") {
          setLivePairOverride(res);
        }
      })
      .catch(() => {
        // Fallback to in-memory report pair record
      });
    return () => {
      cancelled = true;
    };
  }, [activePayload, selectedPairKey]);

  if (reportLoading) {
    return <ScreenSkeleton label="Loading similarity matrix..." />;
  }

  if (reportError) {
    return (
      <ErrorStatePanel
        title="Similarity analysis load error"
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

  const { candidates, report } = activePayload;
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const selectedPair =
    livePairOverride || (selectedPairKey ? pairLookup.get(selectedPairKey) ?? null : null);

  const candA = selectedPair ? candidateMap.get(selectedPair.candidateAId) : undefined;
  const candB = selectedPair ? candidateMap.get(selectedPair.candidateBId) : undefined;

  const sortedPairs = [...report.pairResults].sort(
    (a, b) => b.similarityScore - a.similarityScore
  );

  const selectPair = (aId: string, bId: string) => {
    const key = `${aId}:${bId}`;
    setSelectedPairKey(key);
    setSearchParams({ pair: key });
  };

  const getLineHighlightClass = (
    lineNumber: number,
    tiles: MatchedTile[],
    side: "source" | "target"
  ): string => {
    if (activeTileIndex !== null && tiles[activeTileIndex]) {
      const active = tiles[activeTileIndex];
      const start = side === "source" ? active.sourceStartLine : active.targetStartLine;
      const end = side === "source" ? active.sourceEndLine : active.targetEndLine;
      if (lineNumber >= start && lineNumber <= end) {
        return "code-line--active-tile";
      }
    }
    const inAnyTile = tiles.some((t) => {
      const start = side === "source" ? t.sourceStartLine : t.targetStartLine;
      const end = side === "source" ? t.sourceEndLine : t.targetEndLine;
      return lineNumber >= start && lineNumber <= end;
    });
    return inAnyTile ? "code-line--matched" : "";
  };

  return (
    <div style={{ display: "grid", gap: "18px" }}>
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
            Pairwise Token Similarity & Diff Inspector
          </h1>
          <p className="text-secondary" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
            Combined score = <code className="mono">0.35 × Winnowing (k=8, w=6)</code> +{" "}
            <code className="mono">0.65 × Greedy String Tiling (min run=5)</code>. Token-based
            structural comparison.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }} role="tablist" aria-label="Matrix or Table view">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "matrix"}
            className={`btn ${viewMode === "matrix" ? "btn--primary" : ""}`} onClick={() => setViewMode("matrix")} > N×N Score Matrix </button> <button type="button" role="tab" aria-selected={viewMode === "table"} className={`btn ${viewMode === "table" ? "btn--primary" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Accessible Pair Table ({report.pairResults.length})
          </button>
        </div>
      </div>

      <section className="panel" aria-label="Collusion cluster leads">
        <div className="panel-header">
          <h2 className="panel-title">Collusion Cluster Leads (Graph Join ≥ 0.70)</h2>
          <span className="mono text-muted" style={{ fontSize: "11px" }}>
            Clusters are leads for human review, not automated findings of misconduct
          </span>
        </div>
        <div className="panel-body">
          {report.clusters.length === 0 ? (
            <div className="text-secondary">
              No connected candidate clusters crossed the 0.70 clustering threshold.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {report.clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--risk-collusion-border)",
                    borderRadius: "var(--radius-sm)",
                    display: "grid",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="status-badge status-badge--collusion">
                      [!] CLUSTER {cluster.id}
                    </span>
                    <span className="mono" style={{ fontSize: "12px", fontWeight: 600 }}>
                      Peak {(cluster.maxSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mono text-secondary" style={{ fontSize: "11px" }}>
                    Members:{" "}
                    {cluster.candidateIds
                      .map((id) => candidateMap.get(id)?.candidateName || id)
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {viewMode === "matrix" ? (
        <section className="panel" aria-label="Pairwise similarity matrix">
          <div className="panel-header">
            <h2 className="panel-title">
              N×N Pairwise Matrix ({candidates.length} × {candidates.length})
            </h2>
            <div className="mono text-muted" style={{ fontSize: "11px" }}>
              Legend: [C] ≥ 80% Collusion Flag • [S] 55–79% Suspicious • [·] &lt; 55% Clear
            </div>
          </div>
          <div className="panel-body table-wrap">
            <table className="matrix-grid" aria-label="Pairwise similarity scores">
              <thead>
                <tr>
                  <th className="matrix-header-cell">Candidate</th>
                  {candidates.map((c) => (
                    <th key={c.id} className="matrix-header-cell" title={c.candidateName}>
                      {c.candidateName.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map((rowCand) => (
                  <tr key={rowCand.id}>
                    <th
                      scope="row"
                      className="matrix-header-cell"
                      style={{ textAlign: "left" }}
                      title={rowCand.candidateName}
                    >
                      {rowCand.candidateName}
                    </th>
                    {candidates.map((colCand) => {
                      if (rowCand.id === colCand.id) {
                        return (
                          <td
                            key={colCand.id}
                            style={{
                              background: "var(--bg-base)",
                              color: "var(--text-muted)",
                              width: "68px",
                              height: "36px",
                            }}
                          >
                            —
                          </td>
                        );
                      }
                      const pair = pairLookup.get(`${rowCand.id}:${colCand.id}`);
                      if (!pair) {
                        return <td key={colCand.id}>N/A</td>;
                      }
                      const isSelected =
                        selectedPairKey === `${rowCand.id}:${colCand.id}` ||
                        selectedPairKey === `${colCand.id}:${rowCand.id}`;

                      const statusClass =
                        pair.verdict === "COLLUSION_DETECTED"
                          ? "matrix-cell-btn--collusion"
                          : pair.verdict === "SUSPICIOUS"
                          ? "matrix-cell-btn--suspicious"
                          : "matrix-cell-btn--clear";

                      const tagSymbol =
                        pair.verdict === "COLLUSION_DETECTED"
                          ? "[C]"
                          : pair.verdict === "SUSPICIOUS"
                          ? "[S]"
                          : "[·]";

                      return (
                        <td key={colCand.id}>
                          <button
                            type="button"
                            className={`matrix-cell-btn ${statusClass}${
                              isSelected ? "matrix-cell-btn--selected" : ""
                            }`}
                            onClick={() => selectPair(rowCand.id, colCand.id)}
                            title={`${rowCand.candidateName} vs${colCand.candidateName}: ${( pair.similarityScore * 100 ).toFixed(1)}% (${pair.verdict}) — Winnowing ${( pair.winnowingScore * 100 ).toFixed(1)}%, Tiling${(pair.tilingScore * 100).toFixed(1)}%`}
                            aria-label={`Compare ${rowCand.candidateName} and${
                              colCand.candidateName
                            }, score ${(pair.similarityScore * 100).toFixed(1)} percent, verdict${
                              pair.verdict
                            }`}
                          >
                            <span>{(pair.similarityScore * 100).toFixed(0)}%</span>
                            <span style={{ fontSize: "9px" }}>{tagSymbol}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel" aria-label="Accessible pairwise comparisons table">
          <div className="panel-header">
            <h2 className="panel-title">All Pairwise Comparisons</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate A</th>
                  <th>Candidate B</th>
                  <th>Combined</th>
                  <th>Winnowing (35%)</th>
                  <th>Greedy String Tiling (65%)</th>
                  <th>Matched Tiles</th>
                  <th>Verdict</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {sortedPairs.map((pair) => {
                  const a = candidateMap.get(pair.candidateAId);
                  const b = candidateMap.get(pair.candidateBId);
                  return (
                    <tr key={`${pair.candidateAId}:${pair.candidateBId}`}>
                      <td>{a?.candidateName || pair.candidateAId}</td>
                      <td>{b?.candidateName || pair.candidateBId}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {(pair.similarityScore * 100).toFixed(1)}%
                      </td>
                      <td className="mono">{(pair.winnowingScore * 100).toFixed(1)}%</td>
                      <td className="mono">{(pair.tilingScore * 100).toFixed(1)}%</td>
                      <td className="mono">{pair.matchedTiles.length}</td>
                      <td>
                        <PairVerdictBadge verdict={pair.verdict} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => selectPair(pair.candidateAId, pair.candidateBId)}
                        >
                          Select Pair
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedPair && (
        <section className="panel" aria-label="Selected pair comparison detail">
          <div className="panel-header" style={{ flexWrap: "wrap" }}>
            <div>
              <h2 className="panel-title" style={{ fontSize: "15px" }}>
                Pair Evidence: {candA?.candidateName || selectedPair.candidateAId} ↔{" "}
                {candB?.candidateName || selectedPair.candidateBId}
              </h2>
              <div className="mono text-secondary" style={{ fontSize: "11px", marginTop: "2px" }}>
                Combined: {(selectedPair.similarityScore * 100).toFixed(1)}% • Winnowing:{" "}
                {(selectedPair.winnowingScore * 100).toFixed(1)}% • Greedy String Tiling:{" "}
                {(selectedPair.tilingScore * 100).toFixed(1)}% •{" "}
                {selectedPair.matchedTiles.length} matched token tiles
              </div>
            </div>
            <PairVerdictBadge verdict={selectedPair.verdict} />
          </div>

          <div className="panel-body" style={{ display: "grid", gap: "14px" }}>
            <div>
              <div className="mono text-muted" style={{ fontSize: "11px", marginBottom: "6px" }}>
                MATCHED TOKEN TILES (CLICK TO HIGHLIGHT SPECIFIC REGION)
              </div>
              {selectedPair.matchedTiles.length === 0 ? (
                <div className="text-secondary">
                  No contiguous token runs met the minimum run-length threshold (5 tokens).
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <button
                    type="button"
                    className={`btn ${activeTileIndex === null ? "btn--primary" : ""}`} style={{ height: "26px", fontSize: "11px" }} onClick={() => setActiveTileIndex(null)} > All Tiles ({selectedPair.matchedTiles.length}) </button> {selectedPair.matchedTiles.map((tile, idx) => ( <button key={`${tile.sourceStartLine}-${tile.targetStartLine}-${idx}`}
                      type="button"
                      className={`btn mono ${activeTileIndex === idx ? "btn--primary" : ""}`}
                      style={{ height: "26px", fontSize: "11px" }}
                      onClick={() => setActiveTileIndex(idx)}
                    >
                      Tile #{idx + 1}: L{tile.sourceStartLine}–{tile.sourceEndLine} ↔ L
                      {tile.targetStartLine}–{tile.targetEndLine} ({tile.tokenCount} tok)
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="diff-grid">
              <div>
                <div
                  className="mono"
                  style={{
                    padding: "6px 10px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderBottom: "none",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  A: {candA?.candidateName} ({candA?.filename})
                </div>
                <div className="code-viewer">
                  {(candA?.sourceCode || "").split("\n").map((line, i) => {
                    const lineNumber = i + 1;
                    const hl = getLineHighlightClass(
                      lineNumber,
                      selectedPair.matchedTiles,
                      "source"
                    );
                    return (
                      <div key={lineNumber} className={`code-line ${hl}`}> <span className="code-gutter">{lineNumber}</span> <span>{line || " "}</span> </div> ); })} </div> </div>  <div> <div className="mono" style={{ padding: "6px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderBottom: "none", fontSize: "11px", fontWeight: 600, }} > B: {candB?.candidateName} ({candB?.filename}) </div> <div className="code-viewer"> {(candB?.sourceCode || "").split("\n").map((line, i) => { const lineNumber = i + 1; const hl = getLineHighlightClass( lineNumber, selectedPair.matchedTiles, "target" ); return ( <div key={lineNumber} className={`code-line ${hl}`}>
                        <span className="code-gutter">{lineNumber}</span>
                        <span>{line || " "}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
