import { useMemo } from 'react';
import { Layers, SplitSquareVertical } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';
import type { GraphNode, SimilarityResult } from '../../lib/types';

interface SimilarityMatrixProps {
  nodes: GraphNode[];
  pairwiseResults: SimilarityResult[];
  onOpenDiff: (candAId: string, candBId: string) => void;
}

export function SimilarityMatrix({
  nodes,
  pairwiseResults,
  onOpenDiff,
}: SimilarityMatrixProps) {
  // Build lookup map for (candAId + ':' + candBId) -> score & result
  const lookup = useMemo(() => {
    const map = new Map<string, { score: number; verdict: string }>();
    for (const pair of pairwiseResults) {
      map.set(`${pair.candidateAId}:${pair.candidateBId}`, {
        score: pair.similarityScore,
        verdict: pair.verdict,
      });
      map.set(`${pair.candidateBId}:${pair.candidateAId}`, {
        score: pair.similarityScore,
        verdict: pair.verdict,
      });
    }
    return map;
  }, [pairwiseResults]);

  // Color generator based on score
  const getCellBg = (score: number, isSelf: boolean) => {
    if (isSelf) return 'var(--z-surface-3)';
    if (score >= 0.75) return 'var(--z-heat-100)';
    if (score >= 0.6) return 'var(--z-heat-80)';
    if (score >= 0.4) return 'var(--z-heat-60)';
    if (score >= 0.25) return 'var(--z-heat-40)';
    if (score > 0.05) return 'var(--z-heat-20)';
    return 'var(--z-heat-0)';
  };

  const getCellTextColor = (score: number, isSelf: boolean) => {
    if (isSelf) return 'var(--z-text-muted)';
    if (score >= 0.4) return '#FFFFFF';
    return 'var(--z-text-secondary)';
  };

  return (
    <div className="bg-z-surface-1 border border-z-border rounded-md p-4 sm:p-5 shadow-z-sm space-y-4">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-z-border pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-z-accent" />
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-z-text-primary">
              Pairwise Similarity Heatmap (NxN Matrix)
            </h3>
            <p className="text-[11px] font-mono text-z-text-muted">
              Winnowing fingerprint + AST tiling cross-correlation. Click any non-diagonal cell to inspect diff.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 font-mono text-[10px] text-z-text-muted">
          <span>0%</span>
          <div className="flex h-3 w-28 rounded overflow-hidden border border-z-border">
            <span className="flex-1 bg-[var(--z-heat-0)]" />
            <span className="flex-1 bg-[var(--z-heat-20)]" />
            <span className="flex-1 bg-[var(--z-heat-40)]" />
            <span className="flex-1 bg-[var(--z-heat-60)]" />
            <span className="flex-1 bg-[var(--z-heat-80)]" />
            <span className="flex-1 bg-[var(--z-heat-100)]" />
          </div>
          <span>100%</span>
        </div>
      </div>

      {/* Heatmap Table Container */}
      <div className="overflow-x-auto max-w-full pb-2">
        <table className="border-collapse font-mono text-xs select-none">
          <thead>
            <tr>
              <th className="p-2 text-left font-bold text-z-text-muted uppercase text-[10px] w-28 shrink-0">
                Candidate
              </th>
              {nodes.map((n) => (
                <th
                  key={`th-${n.id}`}
                  className="p-1.5 text-center font-semibold text-z-text-secondary text-[11px] min-w-[54px] max-w-[70px] truncate"
                  title={n.candidateName}
                >
                  <span className="truncate block">{n.candidateName.split(' ')[0]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((rowNode) => (
              <tr key={`row-${rowNode.id}`} className="hover:bg-z-surface-2/40 transition-colors">
                {/* Row Header */}
                <td
                  className="p-2 font-semibold text-z-text-primary text-xs whitespace-nowrap border-r border-z-border"
                  title={rowNode.candidateName}
                >
                  <div className="flex flex-col">
                    <span className="truncate max-w-[110px]">{rowNode.candidateName}</span>
                    <span className="text-[9px] text-z-text-muted">{rowNode.filename}</span>
                  </div>
                </td>

                {/* Cells */}
                {nodes.map((colNode) => {
                  const isSelf = rowNode.id === colNode.id;
                  const match = lookup.get(`${rowNode.id}:${colNode.id}`);
                  const score = isSelf ? 1 : match ? match.score : 0;
                  const scorePct = Math.round(score * 100);
                  const verdict = match?.verdict || 'CLEAR';

                  const tooltipContent = isSelf ? (
                    <span>Self-comparison: 100% identity</span>
                  ) : (
                    <div className="space-y-1 font-mono text-xs">
                      <div className="font-bold text-white">
                        {rowNode.candidateName} vs {colNode.candidateName}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Similarity: {scorePct}%</span>
                        <span className="text-z-accent">({verdict.replace('_', ' ')})</span>
                      </div>
                      <div className="text-[10px] text-z-text-muted flex items-center gap-1">
                        <SplitSquareVertical className="w-3 h-3 text-z-accent" />
                        Click to launch diff inspector
                      </div>
                    </div>
                  );

                  return (
                    <td key={`cell-${rowNode.id}-${colNode.id}`} className="p-1 text-center">
                      <Tooltip content={tooltipContent}>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => !isSelf && onOpenDiff(rowNode.id, colNode.id)}
                          className="w-12 h-10 rounded flex items-center justify-center font-mono text-[11px] font-bold transition-transform hover:scale-105 cursor-pointer disabled:cursor-default"
                          style={{
                            backgroundColor: getCellBg(score, isSelf),
                            color: getCellTextColor(score, isSelf),
                            border: isSelf ? '1px dashed var(--z-border)' : '1px solid rgba(0,0,0,0.15)',
                          }}
                        >
                          {isSelf ? '—' : `${scorePct}%`}
                        </button>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
