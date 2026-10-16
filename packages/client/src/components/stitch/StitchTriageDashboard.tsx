import { useState, useMemo } from 'react';
import {
  Search,
  Users,
  FileCode,
  UploadCloud,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  ArrowRightLeft,
  Bot,
  SlidersHorizontal,
  LayoutGrid,
  Columns2,
  LogOut,
} from 'lucide-react';
import { StitchDiffModal } from './StitchDiffModal';
import { StitchUploadModal } from './StitchUploadModal';
import { mostSimilarPartner } from '../../lib/utils';
import { fetchComparison } from '../../lib/api';
import type { CohortAnalysisReport, CompareResponse } from '../../lib/types';

interface StitchTriageDashboardProps {
  report: CohortAnalysisReport;
  reportId: string | null;
  userName: string;
  isLoading: boolean;
  onReloadBenchmark: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onSwitchMode: () => void;
  onResetSession: () => void;
}

export function StitchTriageDashboard({
  report,
  reportId,
  userName,
  isLoading,
  onReloadBenchmark,
  onUpload,
  onSwitchMode,
  onResetSession,
}: StitchTriageDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    report.nodes[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ATTENTION' | 'CLEAN'>('ALL');
  const [viewLayout, setViewLayout] = useState<'split' | 'saas'>('split');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeDiff, setActiveDiff] = useState<CompareResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Fallback selected student if current selection not found
  const selectedNode = useMemo(() => {
    return (
      report.nodes.find((n) => n.id === selectedStudentId) ||
      report.nodes[0] ||
      null
    );
  }, [report.nodes, selectedStudentId]);

  // Find partner and cluster details for selected student
  const selectedPartner = useMemo(() => {
    if (!selectedNode) return null;
    const partner = mostSimilarPartner(selectedNode.id, report.pairwiseResults);
    if (!partner) return null;
    const partnerNode = report.nodes.find((n) => n.id === partner.partnerId);
    return {
      partner,
      partnerNode,
    };
  }, [selectedNode, report.pairwiseResults, report.nodes]);

  // Find collusion ring if applicable
  const selectedRing = useMemo(() => {
    if (!selectedNode || selectedNode.clusterId === undefined) return null;
    return report.collusionRings.find((r) => r.ringId === selectedNode.clusterId) || null;
  }, [selectedNode, report.collusionRings]);

  // Pairwise result between selected student and top partner
  const selectedPairwiseResult = useMemo(() => {
    if (!selectedNode || !selectedPartner) return null;
    return (
      report.pairwiseResults.find(
        (p) =>
          (p.candidateAId === selectedNode.id && p.candidateBId === selectedPartner.partner.partnerId) ||
          (p.candidateBId === selectedNode.id && p.candidateAId === selectedPartner.partner.partnerId)
      ) || null
    );
  }, [selectedNode, selectedPartner, report.pairwiseResults]);

  // Filter candidates list
  const filteredNodes = useMemo(() => {
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
  }, [report.nodes, searchQuery, filterMode]);

  // Count summaries
  const needsAttentionCount = useMemo(() => {
    return report.nodes.filter((n) => n.riskLevel === 'HIGH' || n.riskLevel === 'MEDIUM').length;
  }, [report.nodes]);

  const cleanCount = useMemo(() => {
    return report.nodes.filter((n) => n.riskLevel === 'LOW').length;
  }, [report.nodes]);

  const handleOpenDiff = async (candAId: string, candBId: string) => {
    if (!reportId) return;
    setLoadingDiff(true);
    try {
      const data = await fetchComparison(reportId, candAId, candBId);
      setActiveDiff(data);
    } catch (err) {
      console.error('Failed to load comparison diff:', err);
    } finally {
      setLoadingDiff(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const avgMatchPct = Math.round(report.summary.averageSimilarity * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* ═══════════════════════════════════════════════
          HEADER: Stitch Clean Academic Navigation Bar
          ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Course Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-blue-500/20 shrink-0">
              Z
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Zixie Academic
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Integrity Workbench
              </span>
            </div>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700 hidden md:inline">CS401 Fall Cohort</span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="font-medium text-slate-700 hidden lg:inline">Assignment 4</span>
              <span className="text-slate-300 hidden lg:inline">/</span>
              <span className="text-slate-900 font-semibold">Integrity Report</span>
            </nav>
          </div>

          {/* Right: Actions, Mode Toggle & TA Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 8 Submissions Evaluated Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{report.nodes.length} Submissions Evaluated</span>
            </div>

            {/* Layout view switcher (Split Triage vs SaaS Table) */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewLayout('split')}
                className={`p-1.5 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                  viewLayout === 'split'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Split-Pane Triage Workspace"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Triage</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('saas')}
                className={`p-1.5 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                  viewLayout === 'saas'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Clean SaaS Table View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Upload Files</span>
            </button>

            {/* Reload Benchmark Button */}
            <button
              type="button"
              onClick={onReloadBenchmark}
              disabled={isLoading}
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Reload Benchmark Cohort"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Mode Switcher to Dark Forensic Lab */}
            <button
              type="button"
              onClick={onSwitchMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Switch to Forensic Lab Dark Mode"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Forensic Lab (Dark)</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

            {/* Profile Avatar & Details */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center ring-1 ring-slate-200 shadow-2xs">
                {getInitials(userName || 'Abhijeet')}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {userName || 'Abhijeet'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">CS401 Head TA</span>
              </div>
              <button
                type="button"
                onClick={onResetSession}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
                title="Sign out of instructor portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          PAGE SUMMARY & KPI METRICS BAR
          ═══════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Assignment 4: Binary Search Trees &amp; Graph Traversal</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Assignment Triage &amp; Integrity Workbench
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review clustered code similarities, peer overlaps, and AI-generated submissions for CS401 Fall Cohort.
              </p>
            </div>

            {/* Cohort Summary Stats */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center min-w-[85px] shadow-2xs">
                <span className="block text-xl font-bold text-slate-900">{report.nodes.length}</span>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Total Files
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center min-w-[100px] shadow-2xs">
                <span className="block text-xl font-bold text-amber-700">{needsAttentionCount}</span>
                <span className="block text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                  Needs Review
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-center min-w-[100px] shadow-2xs">
                <span className="block text-xl font-bold text-emerald-700">{cleanCount}</span>
                <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-wide">
                  Passed Clean
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-center min-w-[95px] shadow-2xs">
                <span className="block text-xl font-bold text-blue-700">{avgMatchPct}%</span>
                <span className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wide">
                  Cohort Avg
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {viewLayout === 'split' ? (
          /* ========================================================
             LAYOUT 1: SPLIT-PANE TRIAGE WORKSPACE (Screen 2)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Submissions List (~60% = 7 cols on lg) */}
            <section aria-label="Submissions List" className="lg:col-span-7 flex flex-col gap-4">
              {/* Filter and Search Toolbar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or file..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-xs">
                  <span className="text-slate-500 font-medium mr-1 hidden sm:inline">Filter:</span>
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
                    Flagged ({needsAttentionCount})
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

              {/* Submissions Cards List */}
              <div className="space-y-3">
                {filteredNodes.map((node) => {
                  const isSelected = node.id === selectedStudentId;
                  const partnerInfo = mostSimilarPartner(node.id, report.pairwiseResults);
                  const partnerNode = partnerInfo
                    ? report.nodes.find((n) => n.id === partnerInfo.partnerId)
                    : null;
                  const scorePct = partnerInfo ? Math.round(partnerInfo.score * 100) : 0;
                  const isHighRisk = node.riskLevel === 'HIGH';
                  const isMedRisk = node.riskLevel === 'MEDIUM';
                  const isLowRisk = node.riskLevel === 'LOW';

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
                          {/* Avatar Circle */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isHighRisk
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isMedRisk
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {getInitials(node.candidateName)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">
                                {node.candidateName}
                              </h3>
                              <span className="text-xs text-slate-400 font-mono">
                                #STD-{node.id.slice(0, 4)}
                              </span>
                              {isHighRisk && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wider">
                                  Flagged
                                </span>
                              )}
                              {isMedRisk && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider">
                                  Review
                                </span>
                              )}
                              {isLowRisk && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                  Clean
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span className="font-medium text-slate-700 flex items-center gap-1 font-mono">
                                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                                {node.filename}
                              </span>
                              <span>•</span>
                              <span>AST Indexed</span>
                            </div>

                            {/* Tags under candidate */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                              {partnerNode && scorePct >= 65 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-medium">
                                  <Users className="w-3 h-3" />
                                  <span>Matched with {partnerNode.candidateName}</span>
                                </span>
                              )}

                              {node.clusterId !== undefined && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium">
                                  Collusion Group #{node.clusterId}
                                </span>
                              )}

                              {node.aiProbability >= 0.7 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                  <Bot className="w-3 h-3 text-amber-600" />
                                  <span>{Math.round(node.aiProbability * 100)}% AI Probability</span>
                                </span>
                              )}

                              {isLowRisk && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                                  Organic Code Structure
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Similarity score & Inspect button */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <div
                              className={`text-base sm:text-lg font-bold leading-tight ${
                                scorePct >= 70
                                  ? 'text-red-600'
                                  : scorePct >= 50
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              {scorePct}% Match
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {scorePct >= 70 ? 'AST Tree Overlap' : 'Baseline similarity'}
                            </div>
                          </div>

                          {partnerNode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDiff(node.id, partnerNode.id);
                              }}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer ${
                                scorePct >= 70
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredNodes.length === 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No submissions found matching criteria.
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================
               RIGHT COLUMN: Selected Case Summary Card (~40% = 5 cols)
               ======================================================== */}
            <aside aria-label="Selected Case Summary" className="lg:col-span-5 sticky top-20 flex flex-col gap-4">
              {selectedNode ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          selectedNode.riskLevel === 'HIGH'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : selectedNode.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedNode.riskLevel === 'HIGH'
                              ? 'bg-red-600'
                              : selectedNode.riskLevel === 'MEDIUM'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        {selectedNode.riskLevel === 'HIGH'
                          ? 'High Similarity Cluster'
                          : selectedNode.riskLevel === 'MEDIUM'
                          ? 'Potential AI / Plagiarism Review'
                          : 'Clean Candidate Dossier'}
                      </span>
                      <span className="text-xs font-medium text-slate-400 font-mono">
                        Case ID: #{selectedNode.clusterId !== undefined ? `COLL-0${selectedNode.clusterId}` : `CASE-${selectedNode.id.slice(0, 4)}`}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mt-2.5 tracking-tight">
                      {selectedRing
                        ? `Selected Case: Collusion Group #${selectedRing.ringId}`
                        : `Candidate Focus: ${selectedNode.candidateName}`}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {selectedRing
                        ? 'Syntactic AST normalization and string tiling identified cross-submission structural cloning between these students.'
                        : selectedNode.riskLevel === 'LOW'
                        ? 'Unique syntax graph and verified clean lineage with no anomalous overlap detected in cohort.'
                        : 'Stylometric perplexity and heuristic markers warrant manual review.'}
                    </p>
                  </div>

                  {/* Involved Students List */}
                  <div className="p-5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                      {selectedRing
                        ? `Involved Students in Cluster (${selectedRing.candidateIds.length})`
                        : 'Primary Candidate & Top Partner'}
                    </span>

                    <div className="space-y-2.5">
                      {/* Active student */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {getInitials(selectedNode.candidateName)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {selectedNode.candidateName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {selectedNode.filename}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700 px-2 py-0.5 rounded bg-white border border-blue-200">
                          Active Focus
                        </span>
                      </div>

                      {/* Top partner if available */}
                      {selectedPartner?.partnerNode && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {getInitials(selectedPartner.partnerNode.candidateName)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {selectedPartner.partnerNode.candidateName}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                {selectedPartner.partnerNode.filename}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded border ${
                              selectedPartner.partner.score >= 0.7
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {Math.round(selectedPartner.partner.score * 100)}% Match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comparison Breakdown Stats */}
                  {selectedPairwiseResult && (
                    <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Algorithmic Comparison Breakdown
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Winnowing (MOSS)
                          </span>
                          <span className="text-base font-bold text-slate-800">
                            {Math.round(selectedPairwiseResult.winnowingScore * 100)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            k=8 k-gram hash fingerprint
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            RKR-GST Tiling
                          </span>
                          <span className="text-base font-bold text-slate-800">
                            {Math.round(selectedPairwiseResult.tilingScore * 100)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {selectedPairwiseResult.matchedTiles.length} Maximal matching tiles
                          </span>
                        </div>
                      </div>

                      {/* Button to open Side-by-side diff */}
                      {selectedPartner?.partnerNode && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDiff(selectedNode.id, selectedPartner.partnerNode!.id)
                          }
                          disabled={loadingDiff}
                          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>
                            {loadingDiff ? 'Loading Diff...' : 'Launch Side-by-Side Diff Inspector'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* AI Stylometry Heuristics (if flagged) */}
                  {selectedNode.aiProbability >= 0.5 && report.aiResults[selectedNode.id] && (
                    <div className="p-5 border-b border-slate-100 bg-amber-50/40">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                        <Bot className="w-4 h-4 text-amber-600" />
                        <span>AI Stylometry Indicators</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-amber-800">
                        {report.aiResults[selectedNode.id].reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructor / TA Tip */}
                  <div className="p-4 bg-blue-50/60 border-t border-blue-100 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-blue-950 mb-0.5">Tip for Graders</span>
                      Click on any student in the left roster to pivot this case panel and view matching student pairs.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                  Select a candidate from the roster to view integrity dossier.
                </div>
              )}
            </aside>
          </div>
        ) : (
          /* ========================================================
             LAYOUT 2: CLEAN MODERN SAAS DASHBOARD (Screen 5)
             ======================================================== */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Candidate Integrity Cohort Table
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified assessment submissions sorted by risk and AI probability
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {report.nodes.length} Candidates Indexed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Submission File</th>
                      <th className="py-3 px-4">Risk Verdict</th>
                      <th className="py-3 px-4">Top Collusion Peer</th>
                      <th className="py-3 px-4">AI Probability</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.nodes.map((node) => {
                      const partner = mostSimilarPartner(node.id, report.pairwiseResults);
                      const partnerNode = partner
                        ? report.nodes.find((n) => n.id === partner.partnerId)
                        : null;
                      const scorePct = partner ? Math.round(partner.score * 100) : 0;
                      const aiPct = Math.round(node.aiProbability * 100);

                      return (
                        <tr key={node.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                {getInitials(node.candidateName)}
                              </div>
                              <span>{node.candidateName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {node.filename}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                node.riskLevel === 'HIGH'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : node.riskLevel === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {node.riskLevel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {partnerNode ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">
                                  {partnerNode.candidateName}
                                </span>
                                <span
                                  className={`font-mono text-[11px] font-bold ${
                                    scorePct >= 70
                                      ? 'text-red-600'
                                      : scorePct >= 50
                                      ? 'text-amber-600'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  ({scorePct}%)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    aiPct >= 70
                                      ? 'bg-amber-500'
                                      : aiPct >= 40
                                      ? 'bg-blue-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${aiPct}%` }}
                                />
                              </div>
                              <span className="font-mono text-slate-700 font-semibold">
                                {aiPct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {partnerNode && (
                              <button
                                type="button"
                                onClick={() => handleOpenDiff(node.id, partnerNode.id)}
                                className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Diff
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Synchronized Side-by-Side Diff Modal */}
      {activeDiff && (
        <StitchDiffModal
          candA={activeDiff.candA}
          candB={activeDiff.candB}
          comparison={activeDiff.comparison}
          onClose={() => setActiveDiff(null)}
        />
      )}

      {/* Cohort Upload Modal */}
      <StitchUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={onUpload}
        isLoading={isLoading}
      />
    </div>
  );
}
