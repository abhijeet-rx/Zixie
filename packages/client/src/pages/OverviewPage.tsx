import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderCode,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
  CountUp,
  MotionButton,
} from '../components/motion/primitives';
import { EmptyStateView, ErrorStateView } from '../components/ui/StateViews';
import { VerdictBadge } from '../components/ui/VerdictBadge';

export const OverviewPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport } = useApp();
  const navigate = useNavigate();

  // Compute Dolos-inspired 10-bucket similarity distribution histogram
  const distributionBuckets = useMemo(() => {
    const counts = new Array(10).fill(0);
    if (!report) return counts;
    report.pairs.forEach((p) => {
      const idx = Math.min(9, Math.floor(p.combinedScore * 10));
      counts[idx] += 1;
    });
    return counts;
  }, [report]);

  if (loadingReport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="skeleton-shimmer" style={{ height: 32, width: 220 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: 112 }} />
          ))}
        </div>
        <div className="skeleton-shimmer" style={{ height: 260 }} />
      </div>
    );
  }

  if (reportError) {
    return <ErrorStateView message={reportError} onRetry={refreshReport} />;
  }

  if (!report) {
    return (
      <FadeUp>
        <EmptyStateView
          icon={<FolderCode size={20} />}
          heading="No submissions to review yet"
          subtext="Add at least two code submissions to compare them. You can upload code files or a ZIP folder."
          actionLabel="Add submissions"
          onAction={() => navigate('/submissions')}
        />
      </FadeUp>
    );
  }

  const kpiCards = [
    {
      label: 'Total Submissions',
      value: report.totalSubmissions,
      icon: <FolderCode size={16} color="var(--text-secondary)" />,
      route: '/submissions',
      trendLabel: 'In this submission set',
    },
    {
      label: 'Strong Code Matches',
      value: report.flaggedCollusionCount,
      icon: <ShieldAlert size={16} color="var(--risk-collusion)" />,
      route: '/similarity',
      trendLabel: 'Pairs with high overlap',
    },
    {
      label: 'Matches to Review',
      value: report.suspiciousPairCount,
      icon: <AlertTriangle size={16} color="var(--risk-suspicious)" />,
      route: '/similarity',
      trendLabel: 'Worth a closer look',
    },
    {
      label: 'Possible AI-Written Code',
      value: report.elevatedAiSignalCount,
      icon: <Sparkles size={16} color="var(--risk-ai)" />,
      route: '/ai-signals',
      trendLabel: 'Writing patterns to review',
    },
  ];

  const maxBucket = Math.max(1, ...distributionBuckets);

  return (
    <FadeUp style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: 'var(--text-xl)' }}>Review Overview</h1>
          <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Submission set: {report.batchName}
          </p>
          <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Similarity and AI-writing results help guide a review; they do not prove misconduct.
          </p>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <StaggerContainer
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {kpiCards.map((card) => (
          <StaggerItem key={card.label}>
            <MotionButton
              type="button"
              onClick={() => navigate(card.route)}
              className="zixie-card"
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              whileHover={{
                borderColor: 'var(--accent)',
                y: -2,
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {card.label}
                </span>
                {card.icon}
              </div>

              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
                <CountUp value={card.value} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <ArrowUpRight size={12} />
                <span>{card.trendLabel}</span>
              </div>
            </MotionButton>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Dolos-style Pairwise Similarity Distribution + Top Flagged Pairs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="zixie-card" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
            Similarity Across Submissions
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Each bar shows how many pairs fall within a similarity range. Higher scores mean more code in common.
          </p>

          <div
            style={{
              height: 160,
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              alignItems: 'end',
              gap: 'var(--space-2)',
              paddingTop: 'var(--space-4)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {distributionBuckets.map((count, i) => {
              const heightPct = Math.max(4, Math.round((count / maxBucket) * 100));
              const barColor =
                i >= 8
                  ? 'var(--risk-collusion)'
                  : i >= 5
                  ? 'var(--risk-suspicious)'
                  : 'var(--accent)';
              return (
                <div
                  key={i}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            className="mono"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-2)',
            }}
          >
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Highest Priority Pairs Table */}
        <div className="zixie-card" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
            Pairs with the Most Similar Code
          </h2>
          <table className="zixie-table">
            <thead>
              <tr>
                <th>Submissions</th>
                <th>Similarity</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {report.pairs.slice(0, 5).map((pair) => (
                <tr key={pair.pairId}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{pair.candidateAName}</span>
                    <span style={{ color: 'var(--text-muted)' }}> ↔ </span>
                    <span style={{ fontWeight: 500 }}>{pair.candidateBName}</span>
                  </td>
                  <td className="mono">{pair.combinedScore.toFixed(3)}</td>
                  <td>
                    <VerdictBadge verdict={pair.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeUp>
  );
};
