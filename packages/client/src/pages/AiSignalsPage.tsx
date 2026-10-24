import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Sparkles, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AiHeuristicFlag } from '../types/zixie';
import { FadeUp, MotionButton } from '../components/motion/primitives';
import { EmptyStateView, ErrorStateView } from '../components/ui/StateViews';
import { VerdictBadge } from '../components/ui/VerdictBadge';

const READABLE_FLAG_LABELS: Record<AiHeuristicFlag, string> = {
  verboseDocstrings: 'Detailed code explanations',
  uniformCommentDensity: 'Similar amount of comments throughout',
  canonicalNamingPattern: 'Consistent naming style',
  lowEntropyFormatting: 'Very regular formatting',
  standardAiBoilerplate: 'Common AI-style code patterns',
};

export const AiSignalsPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport } = useApp();
  const navigate = useNavigate();
  const [sortAsc, setSortAsc] = useState(false);

  const sortedCandidates = useMemo(() => {
    if (!report) return [];
    return [...report.candidates].sort((a, b) =>
      sortAsc ? a.aiProbability - b.aiProbability : b.aiProbability - a.aiProbability
    );
  }, [report, sortAsc]);

  if (loadingReport) {
    return <div className="skeleton-shimmer" style={{ height: 420 }} />;
  }

  if (reportError) {
    return <ErrorStateView message={reportError} onRetry={refreshReport} />;
  }

  if (!report || report.candidates.length === 0) {
    return (
      <FadeUp>
        <EmptyStateView
          icon={<Sparkles size={20} />}
          heading="No AI writing clues to review yet"
          subtext="Add and compare code submissions first. Zixie will point out writing patterns that may be worth a closer look."
          actionLabel="Upload submissions"
          onAction={() => navigate('/submissions')}
        />
      </FadeUp>
    );
  }

  return (
    <FadeUp style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-xl)' }}>Possible AI-Writing Clues</h1>
      </div>

      {/* Prominent Info Disclaimer Banner */}
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <Info size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span>
          These clues come from patterns in the code and can be wrong. They are not proof that AI was used. Review the work and discuss it with the student or applicant before drawing conclusions.
        </span>
      </div>

      <div className="zixie-card" style={{ overflowX: 'auto' }}>
        <table className="zixie-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>
                <MotionButton
                  type="button"
                  onClick={() => setSortAsc((s) => !s)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  <span>AI-writing estimate</span>
                  <ArrowUpDown size={12} />
                </MotionButton>
              </th>
              <th>Result</th>
              <th>Patterns noticed</th>
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.map((c) => {
              const pct = Math.round(c.aiProbability * 100);
              const barColor =
                pct >= 75
                  ? 'var(--risk-ai)'
                  : pct >= 45
                  ? 'var(--risk-suspicious)'
                  : 'var(--risk-clear)';

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.candidateName}</div>
                    <div
                      className="mono"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                    >
                      {c.filename}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div
                        style={{
                          width: 120,
                          height: 6,
                          backgroundColor: 'var(--bg-elevated)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                      <span className="mono" style={{ fontSize: 'var(--text-xs)' }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <VerdictBadge verdict={c.verdict} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {c.aiFlags.length === 0 ? (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          No strong AI-like patterns found
                        </span>
                      ) : (
                        c.aiFlags.map((flag) => (
                          <span
                            key={flag}
                            style={{
                              padding: '2px var(--space-2)',
                              fontSize: 'var(--text-xs)',
                              backgroundColor: 'rgba(168, 85, 247, 0.12)',
                              border: '1px solid rgba(168, 85, 247, 0.35)',
                              color: 'var(--risk-ai)',
                              borderRadius: 'var(--radius-control)',
                            }}
                          >
                            {READABLE_FLAG_LABELS[flag] || flag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FadeUp>
  );
};
