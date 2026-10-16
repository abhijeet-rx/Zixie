import { useState, useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  Bot,
  ArrowRight,
  ArrowRightLeft,
  Sparkles,
  FolderArchive,
} from 'lucide-react';
import { mostSimilarPartner } from '@/lib/utils';
import type { CohortAnalysisReport } from '@/lib/types';

interface SubmissionsScreenProps {
  report: CohortAnalysisReport | null;
  isLoading: boolean;
  onReloadBenchmark: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onOpenDiff: (candAId: string, candBId: string) => void;
  loadingDiff: boolean;
}

export function SubmissionsScreen({
  report,
  isLoading,
  onReloadBenchmark,
  onUpload,
  onOpenDiff,
  loadingDiff,
}: SubmissionsScreenProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ATTENTION' | 'CLEAN'>('ALL');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // File dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploadError(null);
      setUploadSuccess(null);
      try {
        await onUpload(acceptedFiles);
        setUploadSuccess(`Successfully ingested and analyzed ${acceptedFiles.length} file(s)!`);
        setTimeout(() => setUploadSuccess(null), 4000);
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/plain': ['.py', '.java', '.cpp', '.c', '.ts', '.js', '.go', '.rs'],
      'application/x-zip-compressed': ['.zip'],
    },
    disabled: isLoading,
  });

  // Selected student node
  const activeStudentId = selectedStudentId || report?.nodes[0]?.id || '';
  const selectedNode = useMemo(() => {
    if (!report) return null;
    return report.nodes.find((n) => n.id === activeStudentId) || report.nodes[0] || null;
  }, [report, activeStudentId]);

  // Partner info
  const selectedPartner = useMemo(() => {
    if (!selectedNode || !report) return null;
    const partner = mostSimilarPartner(selectedNode.id, report.pairwiseResults);
    if (!partner) return null;
    const partnerNode = report.nodes.find((n) => n.id === partner.partnerId);
    return { partner, partnerNode };
  }, [selectedNode, report]);

  // Collusion ring
  const selectedRing = useMemo(() => {
    if (!selectedNode || selectedNode.clusterId === undefined || !report) return null;
    return report.collusionRings.find((r) => r.ringId === selectedNode.clusterId) || null;
  }, [selectedNode, report]);

  // Pairwise result
  const selectedPairwiseResult = useMemo(() => {
    if (!selectedNode || !selectedPartner || !report) return null;
    return (
      report.pairwiseResults.find(
        (p) =>
          (p.candidateAId === selectedNode.id && p.candidateBId === selectedPartner.partner.partnerId) ||
          (p.candidateBId === selectedNode.id && p.candidateAId === selectedPartner.partner.partnerId)
      ) || null
    );
  }, [selectedNode, selectedPartner, report]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!report) return [];
    return report.nodes.filter((node) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        node.candidateName.toLowerCase().includes(q) ||
        node.filename.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterMode === 'ATTENTION') {
        return node.riskLevel === 'HIGH' || node.riskLevel === 'MEDIUM';
      }
      if (filterMode === 'CLEAN') {
        return node.riskLevel === 'LOW';
      }
      return true;
    });
  }, [report, searchQuery, filterMode]);

  const avgMatchPct = report ? Math.round(report.summary.averageSimilarity * 100) : 0;
  const flaggedCount = report
    ? report.nodes.filter((n) => n.riskLevel === 'HIGH' || n.riskLevel === 'MEDIUM').length
    : 0;
  const cleanCount = report ? report.nodes.filter((n) => n.riskLevel === 'LOW').length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-blue-600" />
              <span>Upload &amp; Ingest Student Answers</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Drag and drop archive files or click to upload source code files for algorithmic integrity evaluation.
            </p>
          </div>

          <button
            type="button"
            onClick={onReloadBenchmark}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Benchmark Answers (8 Students)</span>
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/60 shadow-sm'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="text-sm font-bold text-slate-800">
            {isDragActive ? 'Drop answer files now...' : 'Drag & drop student answers (.zip or source files)'}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Supports Zip archives, Python (<code className="text-slate-700 font-mono">.py</code>), Java (<code className="text-slate-700 font-mono">.java</code>), C++ (<code className="text-slate-700 font-mono">.cpp</code>), TypeScript (<code className="text-slate-700 font-mono">.ts</code>), and Go (<code className="text-slate-700 font-mono">.go</code>).
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all pointer-events-none"
            >
              {isLoading ? 'Processing Answers...' : 'Browse Local Files'}
            </button>
          </div>
        </div>
      </section>

      {/* Roster & Triage Details */}
      {report && (
        <div className="space-y-6">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Evaluated Answers
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {report.nodes.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {report.summary.totalComparisons} Pairwise combinations
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Attention Required
              </span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {flaggedCount}
              </span>
              <span className="text-[11px] text-amber-700 mt-0.5 block">
                Flagged for high similarity
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Passed Clean
              </span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                {cleanCount}
              </span>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                Unique algorithmic structure
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cohort Avg Match
              </span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {avgMatchPct}%
              </span>
              <span className="text-[11px] text-blue-700 mt-0.5 block">
                Baseline similarity
              </span>
            </div>
          </div>

          {/* Split-Pane View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Submissions list (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Toolbar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or file..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterMode('ALL')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      filterMode === 'ALL'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({report.nodes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('ATTENTION')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      filterMode === 'ATTENTION'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Flagged ({flaggedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('CLEAN')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      filterMode === 'CLEAN'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Clean ({cleanCount})
                  </button>
                </div>
              </div>

              {/* Submission Cards */}
              <div className="space-y-3">
                {filteredNodes.map((node) => {
                  const isSelected = node.id === activeStudentId;
                  const partnerInfo = mostSimilarPartner(node.id, report.pairwiseResults);
                  const partnerNode = partnerInfo
                    ? report.nodes.find((n) => n.id === partnerInfo.partnerId)
                    : null;
                  const scorePct = partnerInfo ? Math.round(partnerInfo.score * 100) : 0;
                  const isHigh = node.riskLevel === 'HIGH';
                  const isMed = node.riskLevel === 'MEDIUM';

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedStudentId(node.id)}
                      className={`bg-white rounded-xl border p-4 transition-all cursor-pointer shadow-2xs hover:shadow-md ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600/15'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isHigh
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isMed
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {node.candidateName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {node.candidateName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isHigh
                                    ? 'bg-red-100 text-red-800'
                                    : isMed
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {node.riskLevel} RISK
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                              {node.filename}
                            </span>
                          </div>
                        </div>

                        {partnerInfo && (
                          <div className="text-right shrink-0">
                            <span
                              className={`text-base font-bold font-mono block ${
                                scorePct >= 70
                                  ? 'text-red-600'
                                  : scorePct >= 40
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {scorePct}%
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Match with {partnerNode?.candidateName.split(' ')[0] || 'Peer'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Candidate Dossier (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 sticky top-20">
              {selectedNode ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Student Dossier
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {selectedNode.candidateName}
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">
                        {selectedNode.filename}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedNode.riskLevel === 'HIGH'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : selectedNode.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {selectedNode.riskLevel} RISK
                    </span>
                  </div>

                  {/* Partner correlation */}
                  {selectedPartner && selectedPairwiseResult && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Highest Similarity Pair
                        </span>
                        <span className="text-sm font-bold font-mono text-red-600">
                          {Math.round(selectedPartner.partner.score * 100)}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                        <span>{selectedNode.candidateName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">
                          {selectedPartner.partnerNode?.candidateName || selectedPartner.partner.partnerId}
                        </span>
                      </div>

                      {/* Technical metric scores */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Winnowing
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {Math.round(selectedPairwiseResult.winnowingScore * 100)}%
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            RKR-GST Tiles
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {Math.round(selectedPairwiseResult.tilingScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenDiff(selectedNode.id, selectedPartner.partnerNode!.id)
                        }
                        disabled={loadingDiff}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>
                          {loadingDiff ? 'Loading Diff...' : 'Open Side-by-Side Code Diff'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Collusion ring indicator */}
                  {selectedRing && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                        <Users className="w-4 h-4 text-red-600" />
                        <span>Collusion Ring Detected (Ring #{selectedRing.ringId})</span>
                      </div>
                      <p className="text-xs text-red-700 leading-relaxed">
                        This student is part of a {selectedRing.candidateIds.length}-member collusion cluster sharing AST subgraphs.
                      </p>
                    </div>
                  )}

                  {/* AI Probability */}
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span>AI Code Generation Score</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-purple-700">
                        {Math.round((selectedNode.aiProbability || 0.12) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-200/50 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.round((selectedNode.aiProbability || 0.12) * 100)}%` }}
                        className="bg-purple-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-12">
                  Select a student from the list to view forensic breakdown.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
