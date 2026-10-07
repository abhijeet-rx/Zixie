import { X, SplitSquareVertical } from 'lucide-react';

interface DiffModalProps {
  candA: {
    id: string;
    candidateName: string;
    filename: string;
    sourceCode: string;
  };
  candB: {
    id: string;
    candidateName: string;
    filename: string;
    sourceCode: string;
  };
  comparison: {
    similarityScore: number;
    winnowingScore: number;
    tilingScore: number;
    verdict: string;
    matchedTiles: Array<{
      sourceStartLine: number;
      sourceEndLine: number;
      targetStartLine: number;
      targetEndLine: number;
      tokenCount: number;
    }>;
  };
  onClose: () => void;
}

export function DiffModal({ candA, candB, comparison, onClose }: DiffModalProps) {
  const linesA = candA.sourceCode.split('\n');
  const linesB = candB.sourceCode.split('\n');

  // Set of matched line numbers for highlighting
  const matchedLinesA = new Set<number>();
  const matchedLinesB = new Set<number>();

  for (const tile of comparison.matchedTiles) {
    for (let l = tile.sourceStartLine; l <= tile.sourceEndLine; l++) {
      matchedLinesA.add(l);
    }
    for (let l = tile.targetStartLine; l <= tile.targetEndLine; l++) {
      matchedLinesB.add(l);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D111A] border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Comparative Code Diff
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                    comparison.verdict === 'COLLUSION_DETECTED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : comparison.verdict === 'SUSPICIOUS'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  }`}
                >
                  {comparison.verdict.replace('_', ' ')}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Structural Tile Matches: {comparison.matchedTiles.length} blocks · Tiling Match:{' '}
                {Math.round(comparison.tilingScore * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Similarity Score</div>
              <div className="text-xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {Math.round(comparison.similarityScore * 100)}%
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Code Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 flex-1 overflow-hidden">
          {/* Candidate A Pane */}
          <div className="flex flex-col min-h-0 bg-[#0A0D14]">
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{candA.candidateName}</span>
              <span className="text-[11px] font-mono text-purple-400">{candA.filename}</span>
            </div>
            <div className="p-4 overflow-auto font-mono text-xs leading-relaxed flex-1 select-text">
              {linesA.map((line, idx) => {
                const lineNum = idx + 1;
                const isMatched = matchedLinesA.has(lineNum);
                return (
                  <div
                    key={idx}
                    className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                      isMatched
                        ? 'bg-purple-950/40 text-purple-200 border-l-2 border-purple-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none text-[11px]">{lineNum}</span>
                    <pre className="overflow-x-auto whitespace-pre font-mono">{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Candidate B Pane */}
          <div className="flex flex-col min-h-0 bg-[#0A0D14]">
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{candB.candidateName}</span>
              <span className="text-[11px] font-mono text-pink-400">{candB.filename}</span>
            </div>
            <div className="p-4 overflow-auto font-mono text-xs leading-relaxed flex-1 select-text">
              {linesB.map((line, idx) => {
                const lineNum = idx + 1;
                const isMatched = matchedLinesB.has(lineNum);
                return (
                  <div
                    key={idx}
                    className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                      isMatched
                        ? 'bg-pink-950/40 text-pink-200 border-l-2 border-pink-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none text-[11px]">{lineNum}</span>
                    <pre className="overflow-x-auto whitespace-pre font-mono">{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Highlighted rows indicate matching logic tiles
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
}
