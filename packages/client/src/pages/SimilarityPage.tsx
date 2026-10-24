import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompareArrows, Table, Grid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PairComparison } from '../types/zixie';
import {
  FadeUp,
  MatrixCellHover,
  MotionButton,
} from '../components/motion/primitives';
import { EmptyStateView, ErrorStateView } from '../components/ui/StateViews';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { PairDetailDrawer } from '../components/similarity/PairDetailDrawer';

/**
 * Interpolate from --bg-elevated (score 0) to --risk-collusion (score 1) using HSL mix
 */
function interpolateHeatColor(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));
  const saturation = Math.round(6 + clamped * 78);
  const lightness = Math.round(14 + clamped * 42);
  const alpha = (0.25 + clamped * 0.75).toFixed(2);
  return `hsla(0, ${saturation}%, ${lightness}%, ${alpha})`;
}

export const SimilarityPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport } = useApp();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [hoveredPair, setHoveredPair] = useState<PairComparison | null>(null);
  const [activePair, setActivePair] = useState<PairComparison | null>(null);

  const pairLookup = useMemo(() => {
    const map = new Map<string, PairComparison>();
    if (!report) return map;
    report.pairs.forEach((p) => {
      map.set(`${p.candidateAId}:${p.candidateBId}`, p);
      map.set(`${p.candidateBId}:${p.candidateAId}`, p);
    });
    return map;
  }, [report]);

  if (loadingReport) {
    return <div className="skeleton-shimmer" style={{ height: 460 }} />;
  }

  if (reportError) {
    return <ErrorStateView message={reportError} onRetry={refreshReport} />;
  }

  if (!report || report.candidates.length === 0) {
    return (
      <FadeUp>
        <EmptyStateView
          icon={<GitCompareArrows size={20} />}
          heading="No pairwise similarity matrix"
          subtext="Run an analysis first to see pairwise similarity scores."
          actionLabel="Go to Submissions"
          onAction={() => navigate('/submissions')}
        />
      </FadeUp>
    );
  }

  const candidates = report.candidates;

  return (
    <FadeUp style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)' }}>Pairwise Similarity Matrix</h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Select any cell to inspect Winnowing + Greedy String Tiling matched regions side-by-side.
          </p>
        </div>

        {/* Accessibility Fallback Toggle: Matrix vs Sortable Table */}
        <MotionButton
          type="button"
          onClick={() => setViewMode((v) => (v === 'matrix' ? 'table' : 'matrix'))}
          className="zixie-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          {viewMode === 'matrix' ? <Table size={14} /> : <Grid size={14} />}
          <span>{viewMode === 'matrix' ? 'Switch to accessible table view' : 'Switch to N×N matrix'}</span>
        </MotionButton>
      </div>

      {/* Hover Tooltip Bar */}
      <div
        className="zixie-card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {hoveredPair ? (
          <>
            <div>
              <strong>{hoveredPair.candidateAName}</strong>
              <span style={{ color: 'var(--text-muted)' }}> vs </span>
              <strong>{hoveredPair.candidateBName}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="mono">Score: {hoveredPair.combinedScore.toFixed(3)}</span>
              <VerdictBadge verdict={hoveredPair.verdict} />
            </div>
          </>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Hover over a matrix cell to preview candidate pair score and verdict.
          </span>
        )}
      </div>

      {viewMode === 'matrix' ? (
        <div className="zixie-card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${candidates.length}, 44px)`,
              gap: 4,
              alignItems: 'center',
            }}
          >
            <div />
            {candidates.map((col) => (
              <div
                key={col.id}
                title={col.candidateName}
                className="mono"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {col.candidateName.slice(0, 6)}
              </div>
            ))}

            {candidates.map((row) => (
              <React.Fragment key={row.id}>
                <div
                  title={row.candidateName}
                  className="mono"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: 'var(--space-2)',
                  }}
                >
                  {row.candidateName}
                </div>

                {candidates.map((col) => {
                  if (row.id === col.id) {
                    return (
                      <div
                        key={`${row.id}-${col.id}`}
                        title={`${row.candidateName} (Self-comparison not applicable)`}
                        style={{
                          width: 44,
                          height: 36,
                          backgroundColor: 'var(--bg-base)',
                          border: '1px dashed var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        —
                      </div>
                    );
                  }

                  const pair = pairLookup.get(`${row.id}:${col.id}`) || null;
                  const score = pair ? pair.combinedScore : 0;

                  return (
                    <MatrixCellHover
                      key={`${row.id}-${col.id}`}
                      onMouseEnter={() => setHoveredPair(pair)}
                      onMouseLeave={() => setHoveredPair(null)}
                      onClick={() => pair && setActivePair(pair)}
                      aria-label={`${row.candidateName} and ${col.candidateName}: ${score.toFixed(
                        3
                      )}`}
                      style={{
                        width: 44,
                        height: 36,
                        backgroundColor: interpolateHeatColor(score),
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        cursor: pair ? 'pointer' : 'default',
                      }}
                    >
                      {score.toFixed(2)}
                    </MatrixCellHover>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="zixie-card" style={{ overflowX: 'auto' }}>
          <table className="zixie-table">
            <thead>
              <tr>
                <th>Candidate A</th>
                <th>Candidate B</th>
                <th>Combined</th>
                <th>Winnowing</th>
                <th>Tiling</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {report.pairs.map((p) => (
                <tr
                  key={p.pairId}
                  onClick={() => setActivePair(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{p.candidateAName}</td>
                  <td>{p.candidateBName}</td>
                  <td className="mono">{p.combinedScore.toFixed(3)}</td>
                  <td className="mono">{p.winnowingScore.toFixed(3)}</td>
                  <td className="mono">{p.tilingScore.toFixed(3)}</td>
                  <td>
                    <VerdictBadge verdict={p.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PairDetailDrawer
        pair={activePair}
        candidateA={candidates.find((c) => c.id === activePair?.candidateAId)}
        candidateB={candidates.find((c) => c.id === activePair?.candidateBId)}
        onClose={() => setActivePair(null)}
      />
    </FadeUp>
  );
};
