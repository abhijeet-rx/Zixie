import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Layers,
  UploadCloud,
  FileCode,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Navbar } from './features/Navbar';
import { MetricsGrid } from './features/MetricsGrid';
import { CandidateTable, type CandidateRow } from './features/CandidateTable';
import { CollusionRingGraph } from './features/CollusionRingGraph';
import { SimilarityMatrix } from './features/SimilarityMatrix';
import { UploadZone } from './features/UploadZone';
import { CommandPalette } from './features/CommandPalette';
import { DiffModal } from './DiffModal';
import { Skeleton } from './ui/skeleton';
import { fetchDemoReport, analyzeFiles, fetchComparison } from '../lib/api';
import { mostSimilarPartner } from '../lib/utils';
import { cn } from '../lib/cn';
import type { CohortAnalysisReport, CompareResponse } from '../lib/types';

interface DashboardProps {
  userName: string;
  onReset: () => void;
  onSwitchToStitch?: () => void;
}

export function Dashboard({ userName, onReset, onSwitchToStitch }: DashboardProps) {
  const [report, setReport] = useState<CohortAnalysisReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDiff, setActiveDiff] = useState<CompareResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'network' | 'matrix' | 'upload'>('roster');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-load benchmark demo on mount
  useEffect(() => {
    loadDemo();
  }, []);

  const loadDemo = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchDemoReport();
      setReport(data.report);
      setReportId(data.reportId);
    } catch (err: any) {
      console.error('Failed to load demo report:', err);
      setErrorMsg(err.message || 'Failed to connect to forensic engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await analyzeFiles(files);
      setReport(data.report);
      setReportId(data.reportId);
      setActiveTab('roster');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'File analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiff = async (candAId: string, candBId: string) => {
    if (!reportId) return;
    try {
      const data = await fetchComparison(reportId, candAId, candBId);
      setActiveDiff(data);
    } catch (err) {
      console.error('Failed to load comparison diff:', err);
    }
  };

  // Build candidate table rows
  const candidateRows = useMemo<CandidateRow[]>(() => {
    if (!report) return [];

    return report.nodes.map((node) => {
      const ai = report.aiResults[node.id];
      const partner = mostSimilarPartner(node.id, report.pairwiseResults);
      const partnerNode = partner ? report.nodes.find((x) => x.id === partner.partnerId) : undefined;

      return {
        id: node.id,
        candidateName: node.candidateName,
        filename: node.filename,
        riskLevel: node.riskLevel,
        clusterId: node.clusterId,
        aiProbability: node.aiProbability,
        aiVerdict: node.aiVerdict,
        aiReasons: ai?.reasons || [],
        topPeerId: partner?.partnerId,
        topPeerName: partnerNode?.candidateName,
        topPeerScore: partner?.score,
      };
    });
  }, [report]);

  const caseId = reportId ? `CASE-${reportId.slice(0, 8).toUpperCase()}` : 'CASE-INITIALIZING';

  return (
    <div className="min-h-screen bg-z-bg text-z-text-primary flex flex-col font-sans transition-colors selection:bg-z-accent selection:text-white pb-16">
      {/* Forensic Navigation Bar */}
      <Navbar
        caseId={caseId}
        userName={userName}
        isLoading={loading}
        onReloadBenchmark={loadDemo}
        onResetSession={onReset}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onSwitchToStitch={onSwitchToStitch}
      />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-md bg-z-flagged-subtle border border-[var(--z-flagged)]/30 text-z-flagged-text flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Engine Alert: {errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-z-text-muted hover:text-z-text-primary font-bold text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Forensic Metric Stat Cards */}
        {report ? (
          <MetricsGrid summary={report.summary} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="border-b border-z-border flex items-center justify-between gap-4 overflow-x-auto">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={cn(
                'flex items-center gap-2 py-3 px-3 sm:px-4 font-mono text-xs border-b-2 transition-colors cursor-pointer whitespace-nowrap',
                activeTab === 'roster'
                  ? 'border-z-accent text-z-text-primary font-semibold'
                  : 'border-transparent text-z-text-muted hover:text-z-text-secondary hover:border-z-border'
              )}
            >
              <FileCode className="w-3.5 h-3.5 text-z-accent" />
              <span>Candidate Roster</span>
              {report && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-z-surface-2 text-z-text-secondary border border-z-border">
                  {report.nodes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('network')}
              className={cn(
                'flex items-center gap-2 py-3 px-3 sm:px-4 font-mono text-xs border-b-2 transition-colors cursor-pointer whitespace-nowrap',
                activeTab === 'network'
                  ? 'border-z-accent text-z-text-primary font-semibold'
                  : 'border-transparent text-z-text-muted hover:text-z-text-secondary hover:border-z-border'
              )}
            >
              <Users className="w-3.5 h-3.5 text-z-flagged" />
              <span>Collusion Network</span>
              {report && report.collusionRings.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-z-flagged-subtle text-z-flagged-text border border-[var(--z-flagged)]/20 font-bold">
                  {report.collusionRings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={cn(
                'flex items-center gap-2 py-3 px-3 sm:px-4 font-mono text-xs border-b-2 transition-colors cursor-pointer whitespace-nowrap',
                activeTab === 'matrix'
                  ? 'border-z-accent text-z-text-primary font-semibold'
                  : 'border-transparent text-z-text-muted hover:text-z-text-secondary hover:border-z-border'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-z-accent" />
              <span>Similarity Heatmap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex items-center gap-2 py-3 px-3 sm:px-4 font-mono text-xs border-b-2 transition-colors cursor-pointer whitespace-nowrap',
                activeTab === 'upload'
                  ? 'border-z-accent text-z-text-primary font-semibold'
                  : 'border-transparent text-z-text-muted hover:text-z-text-secondary hover:border-z-border'
              )}
            >
              <UploadCloud className="w-3.5 h-3.5 text-z-text-secondary" />
              <span>Ingest Submissions</span>
            </button>
          </nav>

          <span className="font-mono text-[11px] text-z-text-muted hidden md:inline shrink-0">
            AST Winnowing & RKR-GST Analysis
          </span>
        </div>

        {/* Tab Views Content */}
        {loading && !report ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-z-text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-z-accent" />
            <p>Initializing AST Tokenizer & Calculating Fingerprints...</p>
          </div>
        ) : (
          <>
            {activeTab === 'roster' && (
              <div className="animate-fade-in">
                <CandidateTable candidates={candidateRows} onOpenDiff={handleOpenDiff} />
              </div>
            )}

            {activeTab === 'network' && report && (
              <div className="animate-fade-in">
                <CollusionRingGraph
                  nodes={report.nodes}
                  edges={report.edges}
                  collusionRings={report.collusionRings}
                  onOpenDiff={handleOpenDiff}
                />
              </div>
            )}

            {activeTab === 'matrix' && report && (
              <div className="animate-fade-in">
                <SimilarityMatrix
                  nodes={report.nodes}
                  pairwiseResults={report.pairwiseResults}
                  onOpenDiff={handleOpenDiff}
                />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="animate-fade-in">
                <UploadZone isLoading={loading} onUpload={handleUpload} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Command Palette */}
      {report && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          nodes={report.nodes}
          onSelectCandidate={(candId) => {
            const cand = report.nodes.find((n) => n.id === candId);
            if (cand) {
              setActiveTab('roster');
            }
          }}
          onReloadBenchmark={loadDemo}
          onResetSession={onReset}
          onSwitchTab={(tab) => {
            if (tab === 'roster' || tab === 'network' || tab === 'matrix' || tab === 'upload') {
              setActiveTab(tab);
            }
          }}
        />
      )}

      {/* Side-by-Side Synchronized Diff Modal */}
      {activeDiff && (
        <DiffModal
          candA={activeDiff.candA}
          candB={activeDiff.candB}
          comparison={activeDiff.comparison}
          onClose={() => setActiveDiff(null)}
        />
      )}
    </div>
  );
}
