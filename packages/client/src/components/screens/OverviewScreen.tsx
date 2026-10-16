import {
  ShieldAlert,
  AlertTriangle,
  Bot,
  ArrowRight,
  TrendingUp,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { CohortAnalysisReport } from '@/lib/types';

interface OverviewScreenProps {
  report: CohortAnalysisReport | null;
  onNavigate: (href: string) => void;
  onReloadBenchmark: () => void;
  isLoading: boolean;
}

export function OverviewScreen({
  report,
  onNavigate,
  onReloadBenchmark,
  isLoading,
}: OverviewScreenProps) {
  const nodeCount = report?.nodes.length || 8;
  const flaggedCount = report
    ? report.nodes.filter((n) => n.riskLevel === 'HIGH' || n.riskLevel === 'MEDIUM').length
    : 3;
  const avgSimilarity = report ? Math.round(report.summary.averageSimilarity * 100) : 32;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Engine Status Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Forensic Engine Active
              </span>
              <span className="text-slate-400 text-xs font-mono">AST Engine v0.1.0 • Spring 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Academic Integrity Pulse &amp; Triage Overview
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time surveillance of student code similarity, multi-author collusion rings, and synthetic AI generation across all course assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/submissions')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Inspect Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onReloadBenchmark}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Reload Benchmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cohort Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{nodeCount}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Ingested
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {report?.summary.totalComparisons || 28} Pairwise combinations verified
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Requires Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{flaggedCount}</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {Math.round((flaggedCount / nodeCount) * 100)}% of cohort
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Collusion rings &amp; high structural overlap
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Generated Signals
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-600">1</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              High Confidence
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Synthetic tokens &amp; LLM boilerplate detected
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mean Similarity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{avgSimilarity}%</span>
            <span className="text-xs font-medium text-slate-500">Normal Range</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Winnowing fingerprint + AST tiling cross-check
          </p>
        </div>
      </div>

      {/* Main Grid: Live Incidents & Course Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Integrity Incidents (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Forensic Priority Alerts</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated flags triaged by AST cross-correlation and Winnowing fingerprints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/similarity')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {/* Incident 1 */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700 border border-red-200">
                    Collusion Cluster #1
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Bob Chen &amp; Charlie Davis
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  94% structural alignment detected across recursive binary search tree methods. Identical identifier token substitutions found.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                  <span>Method: RKR-GST Tiling</span>
                  <span>•</span>
                  <span>Score: 0.94</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/similarity')}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                Review Pair
              </button>
            </div>

            {/* Incident 2 */}
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-700 border border-purple-200">
                    AI Code Anomaly
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Grace Hopper (Solution G)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Perplexity score below 12.3 with synthetic comment syntax characteristic of GPT-4o code generation. Zero syntax defects or drafting revisions.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                  <span>Confidence: 94.2%</span>
                  <span>•</span>
                  <span>Model: GPT-4o</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/ai-detection')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                Analyze AI
              </button>
            </div>

            {/* Incident 3 */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700 border border-amber-200">
                    Partial AST Match
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Frank Miller &amp; Charlie Davis
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  68% similarity in auxiliary utility methods and sorting comparator closures.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                  <span>Method: Winnowing</span>
                  <span>•</span>
                  <span>Score: 0.68</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/submissions')}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                View Dossier
              </button>
            </div>
          </div>
        </div>

        {/* Right: Ongoing Course Assessments (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Active Assessments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Spring 2026 course workload
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/assessments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>All (4)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Project 2: Balanced Search Trees
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                    Triage In Progress
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Java • 120 submissions</span>
                  <span className="font-semibold text-slate-700">3 Flagged</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Midterm Exam: Algorithmic Complexity
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                    Clean Cohort
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Python • 86 submissions</span>
                  <span className="font-semibold text-emerald-600">0 Flagged</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Lab 4: Memory Management
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
                    Completed
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>C++ • 142 submissions</span>
                  <span className="font-semibold text-slate-700">1 Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Integrity Health breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cohort Integrity Distribution
            </h3>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div style={{ width: '62%' }} className="bg-emerald-500" title="Clean (62%)" />
              <div style={{ width: '25%' }} className="bg-amber-400" title="Low Overlap (25%)" />
              <div style={{ width: '13%' }} className="bg-red-500" title="High Risk (13%)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Clean (62%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Low (25%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Flagged (13%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
