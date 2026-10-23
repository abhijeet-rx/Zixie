import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, ChevronLeft, ChevronRight, SplitSquareVertical, FileCode, Copy } from 'lucide-react';
import type { MatchTile } from '../../lib/types';

interface StitchDiffModalProps {
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
    matchedTiles: MatchTile[];
  };
  onClose: () => void;
}

export function StitchDiffModal({
  candA,
  candB,
  comparison,
  onClose,
}: StitchDiffModalProps) {
  const [currentTileIdx, setCurrentTileIdx] = useState(0);
  const [syncScroll, setSyncScroll] = useState(true);
  const [copied, setCopied] = useState('');
  const copySource = async (name: string, source: string) => {
    await navigator.clipboard.writeText(source);
    setCopied(name);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const paneARef = useRef<HTMLDivElement>(null);
  const paneBRef = useRef<HTMLDivElement>(null);

  const linesA = candA.sourceCode.split('\n');
  const linesB = candB.sourceCode.split('\n');

  // Pre-calculate line highlight sets and tile mappings
  const lineToTileA = new Map<number, number>();
  const lineToTileB = new Map<number, number>();

  comparison.matchedTiles.forEach((tile, tIdx) => {
    for (let l = tile.sourceStartLine; l <= tile.sourceEndLine; l++) {
      lineToTileA.set(l, tIdx);
    }
    for (let l = tile.targetStartLine; l <= tile.targetEndLine; l++) {
      lineToTileB.set(l, tIdx);
    }
  });

  const jumpToTile = (idx: number) => {
    if (comparison.matchedTiles.length === 0) return;
    const boundedIdx = Math.max(0, Math.min(idx, comparison.matchedTiles.length - 1));
    setCurrentTileIdx(boundedIdx);

    const tile = comparison.matchedTiles[boundedIdx];
    const lineHeight = 22;

    if (paneARef.current) {
      paneARef.current.scrollTop = Math.max(0, (tile.sourceStartLine - 3) * lineHeight);
    }
    if (paneBRef.current) {
      paneBRef.current.scrollTop = Math.max(0, (tile.targetStartLine - 3) * lineHeight);
    }
  };

  const handleScrollA = () => {
    if (!syncScroll || !paneARef.current || !paneBRef.current) return;
    paneBRef.current.scrollTop = paneARef.current.scrollTop;
  };

  const handleScrollB = () => {
    if (!syncScroll || !paneARef.current || !paneBRef.current) return;
    paneARef.current.scrollTop = paneBRef.current.scrollTop;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'n') jumpToTile(currentTileIdx + 1);
      if (e.key === 'ArrowLeft' || e.key === 'p') jumpToTile(currentTileIdx - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTileIdx, comparison.matchedTiles.length, onClose]);

  const matchPct = Math.round(comparison.similarityScore * 100);
  const winnowPct = Math.round(comparison.winnowingScore * 100);
  const tilingPct = Math.round(comparison.tilingScore * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                matchPct >= 70 ? 'bg-red-600 animate-pulse' : matchPct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Code Comparison: {candA.candidateName} ⇄ {candB.candidateName}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    matchPct >= 70
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {matchPct}% Match ({comparison.verdict})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {comparison.matchedTiles.length} matching contiguous token tiles detected • Winnowing: {winnowPct}% • RKR-GST: {tilingPct}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tile navigation controls */}
            {comparison.matchedTiles.length > 0 && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs font-mono mr-2">
                <button
                  type="button"
                  onClick={() => jumpToTile(currentTileIdx - 1)}
                  disabled={currentTileIdx === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Previous matching tile (Left Arrow)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-slate-600 font-semibold">
                  Tile {currentTileIdx + 1} / {comparison.matchedTiles.length}
                </span>
                <button
                  type="button"
                  onClick={() => jumpToTile(currentTileIdx + 1)}
                  disabled={currentTileIdx >= comparison.matchedTiles.length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Next matching tile (Right Arrow)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSyncScroll(!syncScroll)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                syncScroll
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Toggle Synchronized Scrolling"
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span className="hidden sm:inline">Sync Scroll</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Code Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden flex-1 p-4 bg-slate-50 font-mono text-xs">
          {/* Left Pane: Candidate A */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  A
                </span>
                <span className="text-xs font-bold text-slate-900">{candA.candidateName}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-slate-400" />
                {candA.filename}
              </span>
              <button className="z-copy-button" onClick={() => void copySource('A', candA.sourceCode)}><Copy size={12} />{copied === 'A' ? 'Copied' : 'Copy'}</button>
            </div>

            <div
              ref={paneARef}
              onScroll={handleScrollA}
              className="flex-1 overflow-y-auto p-3 text-[12px] leading-[22px] bg-white font-mono select-text"
              style={{ maxHeight: 'calc(90vh - 220px)' }}
            >
              {linesA.map((line, idx) => {
                const lineNum = idx + 1;
                const isMatched = lineToTileA.has(lineNum);
                const tileIndex = lineToTileA.get(lineNum);
                const isCurrentTile = tileIndex === currentTileIdx;

                return (
                  <div
                    key={`line-a-${lineNum}`}
                    className={`flex items-start rounded px-1 transition-colors ${
                      isCurrentTile
                        ? 'bg-amber-200/90 text-amber-950 font-semibold ring-1 ring-amber-400'
                        : isMatched
                        ? 'bg-amber-100/80 text-amber-900'
                        : 'text-slate-800'
                    }`}
                  >
                    <span className="w-9 shrink-0 text-slate-400 select-none text-right pr-3 font-mono text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap break-all font-mono">{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Candidate B */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  B
                </span>
                <span className="text-xs font-bold text-slate-900">{candB.candidateName}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-slate-400" />
                {candB.filename}
              </span>
              <button className="z-copy-button" onClick={() => void copySource('B', candB.sourceCode)}><Copy size={12} />{copied === 'B' ? 'Copied' : 'Copy'}</button>
            </div>

            <div
              ref={paneBRef}
              onScroll={handleScrollB}
              className="flex-1 overflow-y-auto p-3 text-[12px] leading-[22px] bg-white font-mono select-text"
              style={{ maxHeight: 'calc(90vh - 220px)' }}
            >
              {linesB.map((line, idx) => {
                const lineNum = idx + 1;
                const isMatched = lineToTileB.has(lineNum);
                const tileIndex = lineToTileB.get(lineNum);
                const isCurrentTile = tileIndex === currentTileIdx;

                return (
                  <div
                    key={`line-b-${lineNum}`}
                    className={`flex items-start rounded px-1 transition-colors ${
                      isCurrentTile
                        ? 'bg-amber-200/90 text-amber-950 font-semibold ring-1 ring-amber-400'
                        : isMatched
                        ? 'bg-amber-100/80 text-amber-900'
                        : 'text-slate-800'
                    }`}
                  >
                    <span className="w-9 shrink-0 text-slate-400 select-none text-right pr-3 font-mono text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap break-all font-mono">{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Highlighted sections indicate identical AST token strings (ignoring variable names &amp; formatting).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Finding recorded: Case filed for ${candA.candidateName} ⇄ ${candB.candidateName}`);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Confirm &amp; Record Finding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
