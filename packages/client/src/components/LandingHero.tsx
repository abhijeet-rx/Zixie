import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Terminal,
  Users,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  const [headlineStage, setHeadlineStage] = useState<'question' | 'answer'>('question');

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeadlineStage('answer');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center text-center space-y-10 animate-fade-in font-sans">
      {/* Top Dossier Seal Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-z-surface-1 border border-z-border shadow-z-sm text-z-text-secondary text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-z-accent animate-pulse" />
        <span className="uppercase tracking-wider font-semibold text-z-text-primary">
          Code Forensics Lab
        </span>
        <span className="text-z-text-muted">/</span>
        <span className="text-z-text-muted">v0.1.0 Ingestion Active</span>
      </div>

      {/* Main Headline with Instrument Serif */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display tracking-tight text-z-text-primary leading-[1.05]">
          Cheating?{' '}
          <span
            className={`italic transition-all duration-700 inline-block ${
              headlineStage === 'answer'
                ? 'opacity-100 translate-y-0 text-z-accent font-normal'
                : 'opacity-0 translate-y-3 text-z-text-muted'
            }`}
          >
            Not anymore.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-z-text-secondary font-sans max-w-2xl mx-auto leading-relaxed">
          Zixie uncovers hidden collusion rings, variable-renamed structural plagiarism, and synthetic AI-generated code across candidate test submissions in milliseconds.
        </p>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          className="font-mono text-sm px-8 py-3.5 shadow-z-md group"
        >
          <span>Launch Forensic Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Interactive Simulated Forensic Scanner Preview Card */}
      <div className="w-full max-w-3xl rounded-lg bg-z-surface-1 border border-z-border overflow-hidden shadow-z-lg text-left font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-z-surface-2/80 border-b border-z-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-z-surface-3 border border-z-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-z-surface-3 border border-z-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-z-surface-3 border border-z-border" />
            <span className="text-z-text-muted text-[11px] ml-2">
              zixie-engine --cohort /benchmark/candidates/
            </span>
          </div>
          <span className="text-[10px] text-z-accent uppercase font-bold tracking-wider">
            LIVE K-GRAM SCAN
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-5 space-y-2.5 bg-z-surface-inset text-z-text-secondary leading-relaxed">
          <div className="flex items-center gap-2 text-z-text-muted">
            <span className="text-z-accent font-bold">$</span>
            <span>Parsing 8 candidate submissions across C++, Java, Python, and TypeScript...</span>
          </div>

          <div className="pl-4 border-l-2 border-z-border space-y-1 text-[11px]">
            <div className="flex items-center gap-2 text-z-text-primary">
              <CheckCircle2 className="w-3 h-3 text-z-clear" />
              <span>AST normalization & identifier abstraction complete (4,290 tokens indexed)</span>
            </div>
            <div className="flex items-center gap-2 text-z-text-primary">
              <CheckCircle2 className="w-3 h-3 text-z-clear" />
              <span>Winnowing hash fingerprints (k=5, w=10) dispatched across worker threads</span>
            </div>
            <div className="flex items-center gap-2 text-z-text-primary">
              <CheckCircle2 className="w-3 h-3 text-z-clear" />
              <span>Running Karp-Rabin Greedy String Tiling (RKR-GST) tile matches calculated</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-z-surface-1 border border-[var(--z-flagged)]/30 text-z-flagged-text text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-z-flagged animate-ping" />
              <span className="font-bold">COLLUSION RING #1 DETECTED:</span>
              <span className="text-z-text-primary">candidateA ⇄ candidateB (87% structural match)</span>
            </div>
            <span className="font-bold font-mono text-[11px]">VERDICT: FLAGGED</span>
          </div>
        </div>
      </div>

      {/* 3 Core Dossier Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
        <div className="p-5 rounded-md bg-z-surface-1 border border-z-border shadow-z-sm space-y-2 hover:border-z-border-strong transition-colors">
          <div className="w-8 h-8 rounded bg-z-surface-2 border border-z-border flex items-center justify-center text-z-accent">
            <Terminal className="w-4 h-4" />
          </div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-z-text-primary">
            MOSS & RKR-GST Tiling
          </h2>
          <p className="text-xs text-z-text-secondary leading-relaxed">
            Lexical abstraction and substring tiling that ignores variable renaming, reordered functions, and comments.
          </p>
        </div>

        <div className="p-5 rounded-md bg-z-surface-1 border border-z-border shadow-z-sm space-y-2 hover:border-z-border-strong transition-colors">
          <div className="w-8 h-8 rounded bg-z-surface-2 border border-z-border flex items-center justify-center text-z-flagged">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-z-text-primary">
            Collusion Ring Clustering
          </h2>
          <p className="text-xs text-z-text-secondary leading-relaxed">
            Union-Find connected component graph analysis identifies syndicated groups sharing code across remote test cohorts.
          </p>
        </div>

        <div className="p-5 rounded-md bg-z-surface-1 border border-z-border shadow-z-sm space-y-2 hover:border-z-border-strong transition-colors">
          <div className="w-8 h-8 rounded bg-z-surface-2 border border-z-border flex items-center justify-center text-z-clear">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-z-text-primary">
            Stylometric AI Detection
          </h2>
          <p className="text-xs text-z-text-secondary leading-relaxed">
            Statistical entropy, burstiness, and structural symmetry metrics expose LLM code generation (ChatGPT, Claude, Copilot).
          </p>
        </div>
      </div>
    </div>
  );
}
