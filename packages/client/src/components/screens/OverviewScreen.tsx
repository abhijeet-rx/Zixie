import { useMemo } from 'react';
import { ArrowRight, ArrowUpRight, Bot, Braces, Check, CircleAlert, FileCode2, Network, RefreshCw, ShieldCheck } from 'lucide-react';
import type { CohortAnalysisReport } from '../../lib/types';

interface OverviewScreenProps {
  report: CohortAnalysisReport | null;
  onNavigate: (href: string) => void;
  onReloadBenchmark: () => void;
  isLoading: boolean;
}

export function OverviewScreen({ report, onNavigate, onReloadBenchmark, isLoading }: OverviewScreenProps) {
  const names = useMemo(() => new Map(report?.nodes.map((node) => [node.id, node.candidateName]) ?? []), [report]);
  const flagged = report?.nodes.filter((node) => node.riskLevel !== 'LOW').length ?? 0;
  const highRiskPairs = report?.pairwiseResults
    .filter((pair) => pair.verdict !== 'CLEAR')
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3) ?? [];
  const aiCases = report?.nodes.filter((node) => node.aiVerdict !== 'HUMAN_LIKELY') ?? [];

  return (
    <div className="z-overview">
      <div className="z-page-heading">
        <div>
          <div className="z-eyebrow"><span className="z-eyebrow-mark" /> COURSE INTEGRITY / OVERVIEW</div>
          <h1>Integrity, at a glance.</h1>
          <p>Review this cohort’s submissions, structural matches, and writing signals.</p>
        </div>
        <div className="z-heading-actions">
          <button className="z-button z-button-secondary" onClick={onReloadBenchmark} disabled={isLoading}><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Reload sample</button>
          <button className="z-button z-button-primary" onClick={() => onNavigate('/submissions')}><FileCode2 size={15} /> Review submissions <ArrowRight size={14} /></button>
        </div>
      </div>

      {report ? (
        <>
          <div className="z-stat-grid">
            <div className="z-stat-card z-stat-card-emphasis">
              <span className="z-stat-icon"><FileCode2 size={16} /></span>
              <span className="z-stat-label">Submissions analyzed</span>
              <strong className="z-stat-value">{report.summary.totalCandidates}</strong>
              <span className="z-stat-foot">{report.summary.totalComparisons} pairwise comparisons</span>
              <button className="z-stat-action" onClick={() => onNavigate('/submissions')}>View submissions <ArrowRight size={13} /></button>
            </div>
            <div className="z-stat-card">
              <span className="z-stat-icon z-stat-icon-amber"><CircleAlert size={16} /></span>
              <span className="z-stat-label">Need a closer look</span>
              <strong className="z-stat-value">{flagged}<small> / {report.nodes.length}</small></strong>
              <span className="z-stat-foot">Elevated structural risk</span>
              <button className="z-stat-action" onClick={() => onNavigate('/submissions?filter=attention')}>Review flagged <ArrowRight size={13} /></button>
            </div>
            <div className="z-stat-card">
              <span className="z-stat-icon z-stat-icon-green"><Network size={16} /></span>
              <span className="z-stat-label">Collusion clusters</span>
              <strong className="z-stat-value">{report.summary.collusionRingsCount}</strong>
              <span className="z-stat-foot">Connected groups in this cohort</span>
              <button className="z-stat-action" onClick={() => onNavigate('/similarity')}>View clusters <ArrowRight size={13} /></button>
            </div>
            <div className="z-stat-card">
              <span className="z-stat-icon z-stat-icon-violet"><Bot size={16} /></span>
              <span className="z-stat-label">AI signals</span>
              <strong className="z-stat-value">{report.summary.aiFlaggedCount}</strong>
              <span className="z-stat-foot">Likely AI verdicts · heuristic</span>
              <button className="z-stat-action" onClick={() => onNavigate('/ai-detection')}>Review AI signals <ArrowRight size={13} /></button>
            </div>
          </div>

          <div className="z-overview-grid">
            <section className="z-panel z-priority-panel">
              <div className="z-panel-heading">
                <div><span className="z-section-kicker">REVIEW QUEUE</span><h2>Pairs worth a second look</h2><p>Ranked by structural similarity across the cohort.</p></div>
                <button className="z-text-link" onClick={() => onNavigate('/similarity')}>Open matrix <ArrowUpRight size={14} /></button>
              </div>
              {highRiskPairs.length ? <div className="z-pair-list">
                {highRiskPairs.map((pair, index) => {
                  const tone = pair.verdict === 'COLLUSION_DETECTED' ? 'is-risk' : 'is-review';
                  return <button className="z-pair-row" key={`${pair.candidateAId}-${pair.candidateBId}`} onClick={() => onNavigate('/similarity')}>
                    <span className={`z-pair-index ${tone}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="z-pair-copy"><strong>{names.get(pair.candidateAId) ?? 'Submission'} <i>↔</i> {names.get(pair.candidateBId) ?? 'Submission'}</strong><small>{pair.verdict === 'COLLUSION_DETECTED' ? 'High structural overlap' : 'Review suggested'} <span>·</span> {pair.matchedTiles.length} matching regions</small></span>
                    <span className={`z-match-score ${tone}`}>{Math.round(pair.similarityScore * 100)}<small>%</small></span>
                    <ArrowRight className="z-pair-arrow" size={15} />
                  </button>;
                })}
              </div> : <div className="z-empty-state"><ShieldCheck size={19} /><span>No pairs need review in this cohort.</span></div>}
              <div className="z-panel-foot"><span><i className="z-status-dot z-status-dot-green" /> Similarity scores help prioritize review; they are not a misconduct finding.</span></div>
            </section>

            <section className="z-panel z-signal-panel">
              <div className="z-panel-heading">
                <div><span className="z-section-kicker">COHORT SIGNALS</span><h2>What surfaced</h2></div>
                <span className="z-soft-count">{flagged + aiCases.length} signals</span>
              </div>
              <div className="z-signal-summary">
                <div><span>Average similarity</span><strong>{Math.round(report.summary.averageSimilarity * 100)}<small>%</small></strong></div>
                <div className="z-signal-meter"><i style={{ width: `${Math.min(100, Math.max(0, report.summary.averageSimilarity * 100))}%` }} /></div>
                <span className="z-muted-note">Across {report.summary.totalComparisons} comparisons</span>
              </div>
              {report.collusionRings.length ? <div className="z-cluster-card">
                <span className="z-cluster-icon"><Network size={16} /></span>
                <div><strong>{report.collusionRings.length} connected {report.collusionRings.length === 1 ? 'group' : 'groups'}</strong><small>{report.collusionRings.map((ring) => ring.candidateNames.join(', ')).join(' · ')}</small></div>
                <button onClick={() => onNavigate('/similarity')} aria-label="Open similarity analysis"><ArrowUpRight size={15} /></button>
              </div> : <div className="z-clean-note"><Check size={15} /> No collusion clusters detected.</div>}
              {aiCases.length > 0 && <button className="z-ai-note" onClick={() => onNavigate('/ai-detection')}><span><Bot size={15} /></span><span><strong>{aiCases.length} AI writing {aiCases.length === 1 ? 'signal' : 'signals'}</strong><small>Review each case in context; indicators are heuristic.</small></span><ArrowRight size={14} /></button>}
              {aiCases.length === 0 && <div className="z-muted-inline"><Braces size={14} /> No elevated AI writing signals.</div>}
            </section>
          </div>

          <section className="z-bottom-note"><span className="z-bottom-icon"><ShieldCheck size={17} /></span><p><strong>Evidence first.</strong> Similarity and AI indicators are triage signals. Review the source code and surrounding context before drawing conclusions.</p><button onClick={() => onNavigate('/reports')}>Read a report <ArrowRight size={14} /></button></section>
        </>
      ) : (
        <div className="z-welcome-panel">
          <span className="z-welcome-icon"><FileCode2 size={20} /></span>
          <h2>Bring a cohort into view.</h2>
          <p>Load the sample dataset or upload source files to compare submissions and inspect code overlap.</p>
          <div><button className="z-button z-button-primary" onClick={onReloadBenchmark} disabled={isLoading}><RefreshCw size={14} /> Load sample cohort</button><button className="z-button z-button-secondary" onClick={() => onNavigate('/submissions')}>Upload submissions <ArrowRight size={14} /></button></div>
        </div>
      )}
    </div>
  );
}
