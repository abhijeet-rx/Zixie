import { Download, FileChartColumn, FileJson2, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import type { CohortAnalysisReport } from '../../lib/types';

interface ReportsScreenProps { report?: CohortAnalysisReport | null }

function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) { return `"${value.replace(/"/g, '""')}"`; }

export function ReportsScreen({ report }: ReportsScreenProps) {
  const names = new Map(report?.nodes.map((node) => [node.id, node.candidateName]) ?? []);
  const flaggedPairs = report?.pairwiseResults.filter((pair) => pair.verdict !== 'CLEAR').sort((a, b) => b.similarityScore - a.similarityScore) ?? [];
  const exportCsv = () => {
    if (!report) return;
    const rows = [['candidate', 'file', 'risk_level', 'ai_score', 'ai_verdict', 'cluster_id'], ...report.nodes.map((node) => [node.candidateName, node.filename, node.riskLevel, String(Math.round(node.aiProbability * 100)), node.aiVerdict, node.clusterId === undefined ? '' : String(node.clusterId)])];
    downloadFile('zixie-cohort-summary.csv', rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
  };
  const exportJson = () => {
    if (!report) return;
    downloadFile('zixie-analysis-report.json', JSON.stringify({ exportedAt: new Date().toISOString(), summary: report.summary, submissions: report.nodes, pairs: report.pairwiseResults, clusters: report.collusionRings, aiSignals: report.aiResults }, null, 2), 'application/json');
  };

  return (
    <div className="space-y-5">
      <div className="z-page-heading"><div><div className="z-eyebrow"><span className="z-eyebrow-mark" /> COHORT / EXPORTS</div><h1>Analysis reports</h1><p>Export the current cohort’s computed results for your own review.</p></div></div>
      {report ? <>
        <section className="z-report-overview">
          <div className="z-report-file-icon"><FileChartColumn size={20} /></div>
          <div className="z-report-copy"><span className="z-section-kicker">CURRENT ANALYSIS</span><h2>Cohort summary</h2><p>{report.summary.totalCandidates} submissions <i>·</i> {report.summary.totalComparisons} comparisons <i>·</i> {report.collusionRings.length} connected {report.collusionRings.length === 1 ? 'group' : 'groups'}</p></div>
          <div className="z-report-actions"><button className="z-button z-button-secondary" onClick={exportCsv}><FileSpreadsheet size={14} /> Export CSV</button><button className="z-button z-button-primary" onClick={exportJson}><FileJson2 size={14} /> Export JSON <Download size={13} /></button></div>
        </section>
        <div className="z-report-notice"><ShieldCheck size={16} /><p>Exports contain engine output for review. A similarity or AI score is a triage signal, not a conclusion about a candidate.</p></div>
        <section className="z-panel z-ai-table-panel">
          <div className="z-panel-heading"><div><span className="z-section-kicker">FLAGGED COMPARISONS</span><h2>Pairs with elevated overlap</h2><p>{flaggedPairs.length} pairwise results marked for review.</p></div><span className="z-soft-count">{flaggedPairs.length} pairs</span></div>
          {flaggedPairs.length ? <div className="overflow-x-auto"><table className="z-ai-table"><thead><tr><th>Candidate pair</th><th>Structural match</th><th>Winnowing</th><th>RKR-GST</th><th>Verdict</th></tr></thead><tbody>{flaggedPairs.map((pair) => <tr key={`${pair.candidateAId}-${pair.candidateBId}`}><td><strong>{names.get(pair.candidateAId)} <span className="z-report-join">↔</span> {names.get(pair.candidateBId)}</strong><small>{pair.matchedTiles.length} matched regions</small></td><td>{Math.round(pair.similarityScore * 100)}%</td><td>{Math.round(pair.winnowingScore * 100)}%</td><td>{Math.round(pair.tilingScore * 100)}%</td><td><span className={`z-ai-verdict ${pair.verdict === 'COLLUSION_DETECTED' ? 'is-high' : 'is-review'}`}>{pair.verdict === 'COLLUSION_DETECTED' ? 'High overlap' : 'Review'}</span></td></tr>)}</tbody></table></div> : <div className="z-empty-state"><ShieldCheck size={18} />No pairwise results are flagged for review.</div>}
          <div className="z-panel-foot"><span><i className="z-status-dot z-status-dot-green" /> This report reflects the currently loaded cohort.</span></div>
        </section>
      </> : <div className="z-welcome-panel"><span className="z-welcome-icon"><FileChartColumn size={20} /></span><h2>No report to export.</h2><p>Load a sample cohort or analyze submissions to create a report.</p></div>}
    </div>
  );
}
