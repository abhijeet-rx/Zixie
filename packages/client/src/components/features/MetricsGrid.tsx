import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { FileCode, Sparkles, Users, Bot } from 'lucide-react';
import { cn } from '../../lib/cn';

interface MetricsGridProps {
  summary: {
    totalCandidates: number;
    totalComparisons: number;
    averageSimilarity: number;
    flaggedPairsCount: number;
    collusionRingsCount: number;
    aiFlaggedCount: number;
  };
}

function CountUp({ target, duration = 800, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

export function MetricsGrid({ summary }: MetricsGridProps) {
  const avgSimilarityPct = Math.round(summary.averageSimilarity * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Candidates */}
      <div className="relative bg-z-surface-1 border border-z-border p-4 sm:p-5 rounded-md shadow-z-sm transition-colors group">
        <div className="flex items-center justify-between text-z-text-muted mb-2">
          <span className="z-label">Submissions</span>
          <FileCode className="w-4 h-4 text-z-text-muted group-hover:text-z-text-secondary transition-colors" />
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-z-text-primary tracking-tight">
          <CountUp target={summary.totalCandidates} />
        </div>
        <div className="text-[11px] font-mono text-z-text-muted mt-1.5 flex items-center justify-between">
          <span>{summary.totalComparisons} Pairwise pairs</span>
          <span className="text-z-text-secondary">O(N²)</span>
        </div>
      </div>

      {/* 2. Average Similarity */}
      <div className="relative bg-z-surface-1 border border-z-border p-4 sm:p-5 rounded-md shadow-z-sm transition-colors group">
        <div className="flex items-center justify-between text-z-text-muted mb-2">
          <span className="z-label">Cohort Avg Match</span>
          <Sparkles className="w-4 h-4 text-z-accent" />
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-z-accent tracking-tight">
          <CountUp target={avgSimilarityPct} suffix="%" />
        </div>
        <div className="text-[11px] font-mono text-z-text-muted mt-1.5 flex items-center justify-between">
          <span>Baseline similarity</span>
          <span className="text-z-text-secondary">{summary.flaggedPairsCount} Flagged pairs</span>
        </div>
      </div>

      {/* 3. Collusion Rings */}
      <div className="relative bg-z-surface-1 border border-z-border p-4 sm:p-5 rounded-md shadow-z-sm transition-colors group">
        <div className="flex items-center justify-between text-z-text-muted mb-2">
          <span className="z-label">Collusion Rings</span>
          <Users className={cn('w-4 h-4', summary.collusionRingsCount > 0 ? 'text-z-flagged' : 'text-z-clear')} />
        </div>
        <div
          className={cn(
            'text-2xl sm:text-3xl font-mono font-bold tracking-tight',
            summary.collusionRingsCount > 0 ? 'text-z-flagged' : 'text-z-clear'
          )}
        >
          <CountUp target={summary.collusionRingsCount} />
        </div>
        <div className="text-[11px] font-mono text-z-text-muted mt-1.5 flex items-center justify-between">
          <span>Union-Find clusters</span>
          <span className={summary.collusionRingsCount > 0 ? 'text-z-flagged-text' : 'text-z-clear-text'}>
            {summary.collusionRingsCount > 0 ? 'Action required' : 'None detected'}
          </span>
        </div>
      </div>

      {/* 4. AI Detected */}
      <div className="relative bg-z-surface-1 border border-z-border p-4 sm:p-5 rounded-md shadow-z-sm transition-colors group">
        <div className="flex items-center justify-between text-z-text-muted mb-2">
          <span className="z-label">Stylometric AI Flags</span>
          <Bot className={cn('w-4 h-4', summary.aiFlaggedCount > 0 ? 'text-z-review' : 'text-z-clear')} />
        </div>
        <div
          className={cn(
            'text-2xl sm:text-3xl font-mono font-bold tracking-tight',
            summary.aiFlaggedCount > 0 ? 'text-z-review' : 'text-z-clear'
          )}
        >
          <CountUp target={summary.aiFlaggedCount} />
        </div>
        <div className="text-[11px] font-mono text-z-text-muted mt-1.5 flex items-center justify-between">
          <span>High LLM probability</span>
          <span className={summary.aiFlaggedCount > 0 ? 'text-z-review-text' : 'text-z-clear-text'}>
            Perplexity scan
          </span>
        </div>
      </div>
    </div>
  );
}
