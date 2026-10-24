import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FadeUp, MotionButton } from '../components/motion/primitives';
import { EmptyStateView, ErrorStateView } from '../components/ui/StateViews';
import { VerdictBadge } from '../components/ui/VerdictBadge';

export const ReportsPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport } = useApp();
  const navigate = useNavigate();

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zixie-report-${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!report) return;
    const header = 'PairID,CandidateA,CandidateB,CombinedScore,WinnowingScore,TilingScore,Verdict\n';
    const rows = report.pairs
      .map(
        (p) =>
          `${p.pairId},"${p.candidateAName}","${p.candidateBName}",${p.combinedScore.toFixed(
            3
          )},${p.winnowingScore.toFixed(3)},${p.tilingScore.toFixed(3)},${p.verdict}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zixie-pairs-${report.reportId}.csv`;
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
          heading="No exportable integrity reports"
          subtext="Complete a submission batch analysis to generate owner-scoped audit artifacts."
          actionLabel="Analyze submissions"
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
          <h1 style={{ fontSize: 'var(--text-xl)' }}>Audit Reports</h1>
          <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Scoped to authenticated reviewer · Report ID: {report.reportId}
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
            Export CSV
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
            Export JSON Dossier
          </MotionButton>
        </div>
      </div>

      <div className="zixie-card" style={{ overflowX: 'auto' }}>
        <table className="zixie-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>SHA-256 Fingerprint</th>
              <th>Max Similarity</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {report.candidates.map((c) => (
              <tr key={c.id}>
                <td>{c.candidateName}</td>
                <td className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {c.sha256.slice(0, 16)}…
                </td>
                <td className="mono">{c.maxSimilarityScore.toFixed(3)}</td>
                <td>
                  <VerdictBadge verdict={c.verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeUp>
  );
};
