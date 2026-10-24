import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CandidateSubmission, PairComparison } from '../../types/zixie';
import { SlideInRight, MotionButton } from '../motion/primitives';
import { VerdictBadge } from '../ui/VerdictBadge';
import { CodeViewer } from '../code/CodeViewer';

interface PairDetailDrawerProps {
  pair: PairComparison | null;
  candidateA: CandidateSubmission | undefined;
  candidateB: CandidateSubmission | undefined;
  onClose: () => void;
}

export const PairDetailDrawer: React.FC<PairDetailDrawerProps> = ({
  pair,
  candidateA,
  candidateB,
  onClose,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {pair && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(9, 9, 11, 0.65)',
          }}
          onClick={onClose}
        >
          <SlideInRight
            style={{
              width: 560,
              maxWidth: '100vw',
              height: '100vh',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              overflowY: 'auto',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 'var(--text-base)' }}>
                    {pair.candidateAName} ↔ {pair.candidateBName}
                  </h2>
                  <span
                    className="mono"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}
                  >
                    Pair ID: {pair.pairId}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <VerdictBadge verdict={pair.verdict} />
                  <MotionButton
                    type="button"
                    onClick={onClose}
                    aria-label="Close pair drawer"
                    className="zixie-button"
                    style={{
                      padding: 'var(--space-1)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </MotionButton>
                </div>
              </div>

              {/* Three Score Breakdown Bars: Combined / Winnowing / Tiling */}
              <div
                className="zixie-card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                {[
                  { label: 'Combined Score', score: pair.combinedScore },
                  { label: 'Winnowing Fingerprint', score: pair.winnowingScore },
                  { label: 'Greedy String Tiling', score: pair.tilingScore },
                ].map((metric) => (
                  <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                      <span className="mono">{metric.score.toFixed(3)}</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        width: '100%',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.round(metric.score * 100)}%`,
                          backgroundColor:
                            metric.score >= 0.75
                              ? 'var(--risk-collusion)'
                              : metric.score >= 0.45
                              ? 'var(--risk-suspicious)'
                              : 'var(--risk-clear)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Two-panel Side-by-Side Code Diff with Matched Tile Regions in Amber */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 'var(--text-xs)',
                      marginBottom: 'var(--space-1)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {pair.candidateAName}
                  </div>
                  <CodeViewer
                    code={candidateA?.sourceCode || '// Source unavailable'}
                    language={candidateA?.language || 'python'}
                    highlightedRanges={pair.matchedTiles.map((t) => ({
                      startLine: t.sourceStartLine,
                      endLine: t.sourceEndLine,
                    }))}
                    maxHeight="420px"
                  />
                </div>

                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 'var(--text-xs)',
                      marginBottom: 'var(--space-1)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {pair.candidateBName}
                  </div>
                  <CodeViewer
                    code={candidateB?.sourceCode || '// Source unavailable'}
                    language={candidateB?.language || 'python'}
                    highlightedRanges={pair.matchedTiles.map((t) => ({
                      startLine: t.targetStartLine,
                      endLine: t.targetEndLine,
                    }))}
                    maxHeight="420px"
                  />
                </div>
              </div>
            </div>
          </SlideInRight>
        </div>
      )}
    </AnimatePresence>
  );
};
