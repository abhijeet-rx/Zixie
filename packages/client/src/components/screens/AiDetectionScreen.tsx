import { Bot, CircleHelp, FileCode2, ShieldCheck, Sparkles } from 'lucide-react';
import type { CohortAnalysisReport } from '../../lib/types';

interface AiDetectionScreenProps { report?: CohortAnalysisReport | null }

export function AiDetectionScreen({ report }: AiDetectionScreenProps) {
  const orderedNodes = [...(report?.nodes ?? [])].sort((a, b) => b.aiProbability - a.aiProbability);
  const average = orderedNodes.length
    ? Math.round(orderedNodes.reduce((sum, node) => sum + node.aiProbability, 0) / orderedNodes.length * 100)
    : 0;
  const elevated = orderedNodes.filter((node) => node.aiVerdict !== 'HUMAN_LIKELY').length;

  return (
    <div className="space-y-5">
      <div className="z-page-heading">
        <div><div className="z-eyebrow"><span className="z-eyebrow-mark" /> WRITING PATTERNS / HEURISTICS</div><h1>AI writing signals</h1><p>Inspect the indicators found in submitted code, with the source available for human review.</p></div>
      </div>
      <div className="z-ai-caveat"><span><CircleHelp size={16} /></span><p><strong>These are heuristic signals.</strong> The score reflects code patterns used by Zixie’s local analysis engine. It cannot establish who wrote the code or identify a specific AI tool.</p></div>
      {report ? <>
        <div className="z-stat-grid z-ai-stat-grid">
          <div className="z-stat-card"><span className="z-stat-icon z-stat-icon-violet"><FileCode2 size={16} /></span><span className="z-stat-label">Submissions scanned</span><strong className="z-stat-value">{orderedNodes.length}</strong><span className="z-stat-foot">Current cohort</span></div>
          <div className="z-stat-card"><span className="z-stat-icon z-stat-icon-amber"><Sparkles size={16} /></span><span className="z-stat-label">Elevated signals</span><strong className="z-stat-value">{elevated}</strong><span className="z-stat-foot">Review recommended</span></div>
          <div className="z-stat-card"><span className="z-stat-icon z-stat-icon-green"><Bot size={16} /></span><span className="z-stat-label">Mean heuristic score</span><strong className="z-stat-value">{average}<small>%</small></strong><span className="z-stat-foot">Across this cohort</span></div>
          <div className="z-stat-card"><span className="z-stat-icon"><ShieldCheck size={16} /></span><span className="z-stat-label">Interpretation</span><strong className="z-stat-value z-ai-stat-word">Context matters</strong><span className="z-stat-foot">Not a standalone finding</span></div>
        </div>
        <section className="z-panel z-ai-table-panel">
          <div className="z-panel-heading"><div><span className="z-section-kicker">COHORT BREAKDOWN</span><h2>Signals by submission</h2><p>Sorted from highest to lowest heuristic score.</p></div><span className="z-soft-count">{orderedNodes.length} submissions</span></div>
          {orderedNodes.length ? <div className="overflow-x-auto"><table className="z-ai-table"><thead><tr><th>Candidate</th><th>File</th><th>Heuristic score</th><th>Verdict</th><th>Observed indicators</th></tr></thead><tbody>
            {orderedNodes.map((node) => {
              const result = report.aiResults[node.id];
              const score = Math.round(node.aiProbability * 100);
              const verdict = result?.verdict ?? node.aiVerdict;
              const reasons = result?.reasons ?? [];
              return <tr key={node.id}>
                <td><strong>{node.candidateName}</strong><small>{node.clusterId !== undefined ? `Cluster ${node.clusterId}` : 'No cluster assigned'}</small></td>
                <td><code>{node.filename}</code></td>
                <td><div className="z-ai-score"><span>{score}%</span><i><b style={{ width: `${score}%` }} /></i></div></td>
                <td><span className={`z-ai-verdict ${verdict === 'AI_GENERATED_LIKELY' ? 'is-high' : verdict === 'SUSPICIOUS' ? 'is-review' : 'is-clear'}`}>{verdict === 'AI_GENERATED_LIKELY' ? 'Elevated' : verdict === 'SUSPICIOUS' ? 'Review' : 'No signal'}</span></td>
                <td>{reasons.length ? <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <span className="z-ai-no-reasons">No elevated indicators recorded</span>}</td>
              </tr>;
            })}
          </tbody></table></div> : <div className="z-empty-state"><ShieldCheck size={18} />No submissions in this cohort yet.</div>}
          <div className="z-panel-foot"><span><i className="z-status-dot z-status-dot-green" /> Use these signals to guide closer reading, not as proof of authorship.</span></div>
        </section>
      </> : <div className="z-welcome-panel"><span className="z-welcome-icon"><Bot size={20} /></span><h2>No cohort loaded.</h2><p>Load a sample or upload submissions to see the available writing signals.</p></div>}
    </div>
  );
}
