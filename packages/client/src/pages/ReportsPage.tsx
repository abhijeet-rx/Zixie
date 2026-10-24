import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FadeUp, MotionButton } from '../components/motion/primitives';
import { EmptyStateView, ErrorStateView } from '../components/ui/StateViews';
import { VerdictBadge } from '../components/ui/VerdictBadge';

export const ReportsPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport } = useApp();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [candidateFilter, setCandidateFilter] = useState<'ALL' | 'CLEAR' | 'FLAGGED'>('ALL');

  const filteredCandidates = useMemo(() => {
    if (!report || candidateFilter === 'ALL') return report?.candidates ?? [];
    return report.candidates.filter((candidate) =>
      candidateFilter === 'CLEAR' ? candidate.verdict === 'CLEAR' : candidate.verdict !== 'CLEAR'
    );
  }, [report, candidateFilter]);

  const handleExportJson = () => {
    if (!report) return;
    const { reportId: _reportId, ...reportDetails } = report;
    const exportReport = {
      ...reportDetails,
      candidates: report.candidates.map(({ sha256: _sha256, ...candidate }) => candidate),
    };
    const blob = new Blob([JSON.stringify(exportReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zixie-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!report) return;
    const header = 'Submission 1,Submission 2,Overall match,Text match,Code structure match,Result\n';
    const rows = report.pairs
      .map(
        (p) =>
          `"${p.candidateAName}","${p.candidateBName}",${Math.round(p.combinedScore * 100)}%,${Math.round(
            p.winnowingScore * 100
          )}%,${Math.round(p.tilingScore * 100)}%,${p.verdict === 'COLLUSION_DETECTED' ? 'Strong match - review' : p.verdict === 'SUSPICIOUS' ? 'Needs review' : 'No close match'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zixie-pairs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingReport) {
    return <div className="skeleton-shimmer" style={{ height: 320 }} />;
  }

  if (reportError) {
    return <ErrorStateView message={reportError} onRetry={refreshReport} />;
  }

  if (!report) {
    return (
      <FadeUp>
        <EmptyStateView
          icon={<FileSpreadsheet size={20} />}
          heading="No report to download yet"
          subtext="Add at least two code submissions and compare them to create a review report."
          actionLabel="Add submissions"
          onAction={() => navigate('/submissions')}
        />
      </FadeUp>
    );
  }

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
          <h1 style={{ fontSize: 'var(--text-xl)' }}>Review Reports</h1>
          <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Results from your latest set of submissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <MotionButton
            type="button"
            onClick={handleExportCsv}
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
            <Download size={14} />
            Download spreadsheet
          </MotionButton>
          <MotionButton
            type="button"
            onClick={handleExportJson}
            className="zixie-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--accent)',
              color: '#FAFAFA',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Download detailed results
          </MotionButton>
        </div>
      </div>

      <div className="zixie-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Candidates ({filteredCandidates.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }} aria-label="Filter submissions by result">
            {([
              ['ALL', 'All submissions'],
              ['CLEAR', 'No close match'],
              ['FLAGGED', 'Needs review'],
            ] as const).map(([value, label]) => (
              <MotionButton
                key={value}
                type="button"
                aria-pressed={candidateFilter === value}
                onClick={() => setCandidateFilter(value)}
                className="zixie-button"
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  backgroundColor: candidateFilter === value ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                  borderColor: candidateFilter === value ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </MotionButton>
            ))}
          </div>
        </div>
        <p style={{ margin: 'var(--space-2) var(--space-4) 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          “Needs review” includes possible code sharing. Similarity results are a prompt to review, not proof of misconduct.
        </p>
        <div style={{ overflowX: 'auto' }}>
        <table className="zixie-table">
          <thead>
            <tr>
              <th>Student / applicant</th>
              <th>Highest match</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length ? (
              <AnimatePresence initial={false} mode="sync">
                {filteredCandidates.map((c) => (
                  <motion.tr
                    key={c.id}
                    layout={!reducedMotion}
                    initial={reducedMotion ? false : { opacity: 0, filter: 'blur(3px)', y: 4 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, filter: 'blur(3px)', y: -3 }}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <td>{c.candidateName}</td>
                    <td className="mono">{c.maxSimilarityScore.toFixed(3)}</td>
                    <td>
                      <VerdictBadge verdict={c.verdict} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No submissions match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </FadeUp>
  );
};
