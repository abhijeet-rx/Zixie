import { useState, useMemo } from 'react';
import {
  GitCompare,
  Layers,
  Users,
  ArrowRightLeft,
} from 'lucide-react';
import type { CohortAnalysisReport } from '@/lib/types';

interface SimilarityScreenProps {
  report: CohortAnalysisReport | null;
  onOpenDiff: (candAId: string, candBId: string) => void;
  loadingDiff: boolean;
}

export function SimilarityScreen({
  report,
  onOpenDiff,
  loadingDiff,
}: SimilarityScreenProps) {
  const [selectedPair, setSelectedPair] = useState<{
    candAId: string;
    candBId: string;
    candAName: string;
    candBName: string;
    score: number;
    winnowing: number;
    tiling: number;
  } | null>(null);

  const nodes = report?.nodes || [];
  const pairwise = report?.pairwiseResults || [];

  // Build matrix lookup
  const lookup = useMemo(() => {
    const map = new Map<string, { score: number; winnowing: number; tiling: number }>();
    for (const pair of pairwise) {
      map.set(`${pair.candidateAId}:${pair.candidateBId}`, {
        score: pair.similarityScore,
        winnowing: pair.winnowingScore,
        tiling: pair.tilingScore,
      });
      map.set(`${pair.candidateBId}:${pair.candidateAId}`, {
        score: pair.similarityScore,
        winnowing: pair.winnowingScore,
        tiling: pair.tilingScore,
      });
    }
    return map;
  }, [pairwise]);

  // Collusion clusters
  const clusters = report?.collusionRings || [];

  const getHeatColor = (score: number, isSelf: boolean) => {
    if (isSelf) return 'bg-slate-100 text-slate-400';
    if (score >= 0.75) return 'bg-red-500 text-white font-bold hover:bg-red-600';
    if (score >= 0.6) return 'bg-amber-500 text-white font-bold hover:bg-amber-600';
    if (score >= 0.4) return 'bg-amber-300 text-slate-900 font-semibold hover:bg-amber-400';
    if (score >= 0.25) return 'bg-blue-100 text-blue-900 font-medium hover:bg-blue-200';
    return 'bg-slate-50 text-slate-500 hover:bg-slate-100';
  };

  const handleCellClick = (candAId: string, candBId: string) => {
    if (candAId === candBId) return;
    const item = lookup.get(`${candAId}:${candBId}`);
    const nodeA = nodes.find((n) => n.id === candAId);
    const nodeB = nodes.find((n) => n.id === candBId);
    if (!item || !nodeA || !nodeB) return;

    setSelectedPair({
      candAId,
      candBId,
      candAName: nodeA.candidateName,
      candBName: nodeB.candidateName,
      score: item.score,
      winnowing: item.winnowing,
      tiling: item.tiling,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
              CROSS-CORRELATION ENGINE
            </span>
            <span className="text-xs text-slate-500">
              Winnowing + AST Tiling Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-blue-600" />
            <span>Pairwise Similarity &amp; Collusion Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Interactive N&times;N matrix cross-checking candidate algorithms, greedy string tiles, and multi-student collusion rings.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs shrink-0">
          <span className="text-slate-400 font-mono text-[11px]">Heatmap:</span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">&lt;25%</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">25-40%</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-300 text-slate-900">40-60%</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white">60-75%</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-bold">&gt;75%</span>
          </div>
        </div>
      </div>

      {/* Collusion Rings Summary Cards */}
      {clusters.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Detected Collusion Clusters ({clusters.length} Rings Identified)
              </h2>
            </div>
            <span className="text-xs font-mono text-red-700 font-semibold">
              High Academic Misconduct Risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {clusters.map((ring) => {
              const memberNames = ring.candidateIds
                .map((id) => nodes.find((n) => n.id === id)?.candidateName || id)
                .join(', ');

              return (
                <div
                  key={ring.ringId}
                  className="bg-white/90 backdrop-blur-xs border border-red-200 rounded-xl p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                      Ring #{ring.ringId} • {ring.candidateIds.length} Members
                    </span>
                    <span className="text-xs font-mono font-bold text-red-600">
                      ~{Math.round(ring.averageSimilarity * 100)}% Internal Density
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Members: <span className="font-bold text-slate-900">{memberNames}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Structural graph cycle with identical method AST subtrees and variable rename permutations.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Heatmap + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* NxN Heatmap Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                N&times;N Pairwise Similarity Matrix
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Click any cell to inspect breakdown &amp; diff
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-left font-mono font-bold text-slate-600 w-32">
                    Student
                  </th>
                  {nodes.map((node) => (
                    <th
                      key={node.id}
                      className="p-2 border border-slate-200 bg-slate-50 text-center font-mono font-semibold text-slate-600 text-[11px] whitespace-nowrap min-w-14"
                      title={node.candidateName}
                    >
                      {node.candidateName.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map((rowNode) => (
                  <tr key={rowNode.id}>
                    <td className="p-2 border border-slate-200 font-medium text-slate-900 bg-slate-50 whitespace-nowrap text-xs">
                      {rowNode.candidateName}
                    </td>
                    {nodes.map((colNode) => {
                      const isSelf = rowNode.id === colNode.id;
                      const pair = lookup.get(`${rowNode.id}:${colNode.id}`);
                      const score = isSelf ? 1 : pair ? pair.score : 0;
                      const scorePct = Math.round(score * 100);

                      const isSelected =
                        selectedPair &&
                        ((selectedPair.candAId === rowNode.id && selectedPair.candBId === colNode.id) ||
                          (selectedPair.candAId === colNode.id && selectedPair.candBId === rowNode.id));

                      return (
                        <td
                          key={colNode.id}
                          onClick={() => handleCellClick(rowNode.id, colNode.id)}
                          className={`p-2 border border-slate-200 text-center font-mono transition-all select-none ${
                            isSelf ? 'cursor-default' : 'cursor-pointer'
                          } ${getHeatColor(score, isSelf)} ${
                            isSelected ? 'ring-2 ring-blue-600 z-10' : ''
                          }`}
                          title={`${rowNode.candidateName} vs ${colNode.candidateName}: ${scorePct}%`}
                        >
                          {isSelf ? '—' : `${scorePct}%`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Pair Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 sticky top-20">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Pairwise Inspection
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Comparison Details
            </h2>
          </div>

          {selectedPair ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Candidate Pair</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedPair.score >= 0.7
                        ? 'text-red-600'
                        : selectedPair.score >= 0.4
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {Math.round(selectedPair.score * 100)}% Match
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedPair.candAName}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <span>&bull;&bull;&bull;</span> compared with
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedPair.candBName}
                </div>
              </div>

              {/* Sub-algorithm metrics */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Winnowing Fingerprints</span>
                    <span className="text-[10px] text-slate-400">Rolling hash k-gram token collision</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {Math.round(selectedPair.winnowing * 100)}%
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">RKR-GST Subtree Tiles</span>
                    <span className="text-[10px] text-slate-400">Running Karp-Rabin Greedy Tiling</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {Math.round(selectedPair.tiling * 100)}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDiff(selectedPair.candAId, selectedPair.candBId)}
                disabled={loadingDiff}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{loadingDiff ? 'Loading Diff...' : 'Launch Side-by-Side Diff'}</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10 space-y-2">
              <GitCompare className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Click any non-diagonal percentage in the heatmap to load detailed token analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
