import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompareArrows, Table, Grid, CircleHelp, X, Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();
  const [showMatrixGuide, setShowMatrixGuide] = useState(() => {
    try {
      return sessionStorage.getItem('zixie-matrix-guide-seen') !== 'true';
    } catch {
      return true;
    }
  });

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [hoveredPair, setHoveredPair] = useState<PairComparison | null>(null);
  const [activePair, setActivePair] = useState<PairComparison | null>(null);

  const closeMatrixGuide = () => {
    try {
      sessionStorage.setItem('zixie-matrix-guide-seen', 'true');
    } catch {
      // The guide still closes when session storage is unavailable.
    }
    setShowMatrixGuide(false);
  };

  React.useEffect(() => {
    if (!showMatrixGuide) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMatrixGuide();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showMatrixGuide]);

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
          heading="No comparisons to show yet"
          subtext="Add at least two code submissions to compare them."
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
          <h1 style={{ fontSize: 'var(--text-xl)' }}>Code Similarity Map</h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Compare each submission with the others. Select a cell to see how much code matches and review the matching sections.
          </p>
        </div>

        {/* Accessibility Fallback Toggle: Matrix vs Sortable Table */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <MotionButton
            type="button"
            onClick={() => setShowMatrixGuide(true)}
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
            <CircleHelp size={14} />
            <span>How to read this map</span>
          </MotionButton>
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
            <span>{viewMode === 'matrix' ? 'View as a simple list' : 'View as a grid'}</span>
          </MotionButton>
        </div>
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
              <span className="mono">Similarity: {Math.round(hoveredPair.combinedScore * 100)}%</span>
              <VerdictBadge verdict={hoveredPair.verdict} />
            </div>
          </>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Hover over a cell to preview the two submissions and their match result.
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
                        title={`${row.candidateName} compared with itself`}
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
                      aria-label={`${row.candidateName} and ${col.candidateName}: ${Math.round(score * 100)}% similarity`}
                      style={{
                        width: 44,
                        height: 36,
                        backgroundColor: interpolateHeatColor(score),
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-xs)',
                        cursor: pair ? 'pointer' : 'default',
                      }}
                    >
                      {Math.round(score * 100)}%
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
                <th>Submission 1</th>
                <th>Submission 2</th>
                <th>Overall match</th>
                <th>Text match</th>
                <th>Code structure match</th>
                <th>Result</th>
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
                  <td className="mono">{Math.round(p.combinedScore * 100)}%</td>
                  <td className="mono">{Math.round(p.winnowingScore * 100)}%</td>
                  <td className="mono">{Math.round(p.tilingScore * 100)}%</td>
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

      <AnimatePresence>
        {showMatrixGuide && (
          <motion.div
            role="presentation"
            onClick={closeMatrixGuide}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'grid',
              placeItems: 'center',
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(9, 9, 11, 0.58)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="matrix-guide-title"
              onClick={(event) => event.stopPropagation()}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.985, filter: 'blur(3px)' }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="zixie-card"
              style={{
                width: 'min(100%, 520px)',
                padding: 'var(--space-5)',
                boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <div>
                  <p className="mono" style={{ margin: '0 0 var(--space-1)', color: 'var(--accent)', fontSize: 'var(--text-xs)' }}>
                    QUICK GUIDE
                  </p>
                  <h2 id="matrix-guide-title" style={{ fontSize: 'var(--text-lg)' }}>How to read this map</h2>
                </div>
                <MotionButton
                  type="button"
                  onClick={closeMatrixGuide}
                  aria-label="Close comparison guide"
                  className="zixie-button"
                  style={{ padding: 'var(--space-1)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </MotionButton>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-3)', margin: 'var(--space-4) 0' }}>
                {[
                  ['1', 'Find two submissions', 'Choose a name on the left and another across the top. The cell where they meet shows their comparison.'],
                  ['2', 'Read the score and color', 'Scores run from 0% to 100%. Brighter, warmer cells mean more code is alike. A dash marks a submission compared with itself.'],
                  ['3', 'Review the matching sections', 'Hover for a quick preview. Click a cell to see the scores and the matching code side by side.'],
                ].map(([number, title, description]) => (
                  <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        flex: '0 0 26px',
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                      }}
                    >
                      {number}
                    </span>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 2, fontSize: 'var(--text-sm)' }}>{title}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>{description}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MotionButton
                  type="button"
                  onClick={closeMatrixGuide}
                  className="zixie-button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
                >
                  <Check size={15} />
                  Got it
                </MotionButton>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </FadeUp>
  );
};
