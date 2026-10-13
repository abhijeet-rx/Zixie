import { useState, useRef, useEffect } from 'react';
import {
  X,
  SplitSquareVertical,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sliders,
} from 'lucide-react';
import { ScoreGauge } from './features/ScoreGauge';
import { Button } from './ui/button';
import { cn } from '../lib/cn';

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
  const [currentTileIdx, setCurrentTileIdx] = useState(0);
  const [syncScroll, setSyncScroll] = useState(true);

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

  // Jump to specific tile
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

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const verdict = comparison.verdict;
  const isFlagged = verdict === 'COLLUSION_DETECTED';
  const isReview = verdict === 'SUSPICIOUS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-z-surface-1 border border-z-border rounded-lg w-full max-w-7xl max-h-[94vh] flex flex-col shadow-z-lg overflow-hidden font-sans">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-z-border bg-z-surface-2/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Title & Verdict */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-z-surface-1 border border-z-border flex items-center justify-center text-z-accent shrink-0">
              <SplitSquareVertical className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold tracking-tight text-z-text-primary">
                  FORENSIC DIFF INSPECTION
                </h3>
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border tracking-wider',
                    isFlagged
                      ? 'bg-z-flagged-subtle text-z-flagged-text border-[var(--z-flagged)]/30'
                      : isReview
                      ? 'bg-z-review-subtle text-z-review-text border-[var(--z-review)]/30'
                      : 'bg-z-clear-subtle text-z-clear-text border-[var(--z-clear)]/30'
                  )}
                >
                  {verdict.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] font-mono text-z-text-muted truncate">
                Comparing <span className="text-z-text-secondary font-medium">{candA.candidateName}</span> vs{' '}
                <span className="text-z-text-secondary font-medium">{candB.candidateName}</span>
              </p>
            </div>
          </div>

          {/* Metrics & Jump Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Tile Stepper */}
            {comparison.matchedTiles.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-z-surface-1 border border-z-border font-mono text-xs">
                <button
                  type="button"
                  onClick={() => jumpToTile(currentTileIdx - 1)}
                  disabled={currentTileIdx === 0}
                  className="p-1 rounded hover:bg-z-surface-2 text-z-text-muted hover:text-z-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous matched tile"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-z-text-primary font-bold px-1 text-[11px]">
                  Tile {currentTileIdx + 1} / {comparison.matchedTiles.length}
                </span>
                <button
                  type="button"
                  onClick={() => jumpToTile(currentTileIdx + 1)}
                  disabled={currentTileIdx === comparison.matchedTiles.length - 1}
                  className="p-1 rounded hover:bg-z-surface-2 text-z-text-muted hover:text-z-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Next matched tile"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Sync Scroll Toggle */}
            <button
              type="button"
              onClick={() => setSyncScroll(!syncScroll)}
              className={cn(
                'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] transition-colors cursor-pointer',
                syncScroll
                  ? 'bg-z-surface-3 text-z-accent border-z-accent/40 font-semibold'
                  : 'bg-z-surface-1 text-z-text-muted border-z-border'
              )}
              title="Toggle Synchronized Scrolling"
            >
              <Sliders className="w-3 h-3" />
              <span>Sync Scroll</span>
            </button>

            {/* Score Breakdown */}
            <div className="flex items-center gap-3 pl-2 border-l border-z-border">
              <div className="text-right font-mono">
                <div className="text-[10px] text-z-text-muted">Similarity</div>
                <div className="text-base font-bold text-z-accent">
                  {Math.round(comparison.similarityScore * 100)}%
                </div>
              </div>
              <ScoreGauge score={comparison.similarityScore} size={36} />
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded bg-z-surface-1 hover:bg-z-surface-3 border border-z-border text-z-text-muted hover:text-z-text-primary transition-colors cursor-pointer"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-z-surface-1 hover:bg-z-surface-3 border border-z-border text-z-text-muted hover:text-z-text-primary transition-colors cursor-pointer"
              title="Close Diff (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panes Header Sub-bar */}
        <div className="grid grid-cols-2 divide-x divide-z-border border-b border-z-border bg-z-surface-2/40 font-mono text-xs">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="font-semibold text-z-text-primary">{candA.candidateName}</span>
            <span className="text-[11px] text-z-accent">{candA.filename}</span>
          </div>
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="font-semibold text-z-text-primary">{candB.candidateName}</span>
            <span className="text-[11px] text-z-accent">{candB.filename}</span>
          </div>
        </div>

        {/* Dual Code Viewport */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-z-border flex-1 min-h-0 bg-z-bg select-text">
          {/* Pane A */}
          <div
            ref={paneARef}
            onScroll={handleScrollA}
            className="overflow-y-auto p-3 font-mono text-xs leading-relaxed max-h-[58vh]"
          >
            {linesA.map((line, idx) => {
              const lineNum = idx + 1;
              const tileIdx = lineToTileA.get(lineNum);
              const isMatched = tileIdx !== undefined;
              const isCurrent = tileIdx === currentTileIdx;

              return (
                <div
                  key={`lineA-${idx}`}
                  className={cn(
                    'flex items-start px-2 py-0.5 rounded transition-colors group',
                    isMatched && 'bg-[var(--z-flagged)]/10 text-z-text-primary border-l-2 border-[var(--z-flagged)]',
                    isCurrent && 'bg-[var(--z-flagged)]/20 font-semibold ring-1 ring-[var(--z-flagged)]/40'
                  )}
                >
                  <span className="w-9 shrink-0 text-z-text-muted select-none text-[11px] tabular-nums font-mono">
                    {lineNum}
                  </span>
                  <pre className="overflow-x-auto whitespace-pre font-mono text-z-text-primary flex-1">
                    {line || ' '}
                  </pre>
                </div>
              );
            })}
          </div>

          {/* Pane B */}
          <div
            ref={paneBRef}
            onScroll={handleScrollB}
            className="overflow-y-auto p-3 font-mono text-xs leading-relaxed max-h-[58vh]"
          >
            {linesB.map((line, idx) => {
              const lineNum = idx + 1;
              const tileIdx = lineToTileB.get(lineNum);
              const isMatched = tileIdx !== undefined;
              const isCurrent = tileIdx === currentTileIdx;

              return (
                <div
                  key={`lineB-${idx}`}
                  className={cn(
                    'flex items-start px-2 py-0.5 rounded transition-colors group',
                    isMatched && 'bg-[var(--z-flagged)]/10 text-z-text-primary border-l-2 border-[var(--z-flagged)]',
                    isCurrent && 'bg-[var(--z-flagged)]/20 font-semibold ring-1 ring-[var(--z-flagged)]/40'
                  )}
                >
                  <span className="w-9 shrink-0 text-z-text-muted select-none text-[11px] tabular-nums font-mono">
                    {lineNum}
                  </span>
                  <pre className="overflow-x-auto whitespace-pre font-mono text-z-text-primary flex-1">
                    {line || ' '}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Matched Tiles Dossier Drawer */}
        <div className="px-5 py-3 bg-z-surface-2 border-t border-z-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-z-text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--z-flagged)]" />
              <span>{comparison.matchedTiles.length} Matched AST Subtrees</span>
            </span>
            <span className="text-z-text-muted hidden sm:inline">·</span>
            <span className="text-z-text-secondary hidden sm:inline">
              Winnowing Score: {Math.round(comparison.winnowingScore * 100)}%
            </span>
            <span className="text-z-text-muted hidden sm:inline">·</span>
            <span className="text-z-text-secondary hidden sm:inline">
              RKR-GST Tiling: {Math.round(comparison.tilingScore * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} className="font-mono text-xs">
              Close Diff
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
