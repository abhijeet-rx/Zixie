import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileCode,
  Users,
  Bot,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DiffModal } from './DiffModal';

interface DashboardProps {
  userName: string;
  onReset: () => void;
}

interface CohortReport {
  summary: {
    totalCandidates: number;
    totalComparisons: number;
    averageSimilarity: number;
    flaggedPairsCount: number;
    collusionRingsCount: number;
    aiFlaggedCount: number;
  };
  nodes: Array<{
    id: string;
    candidateName: string;
    filename: string;
    aiProbability: number;
    aiVerdict: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    clusterId?: number;
  }>;
  collusionRings: Array<{
    ringId: number;
    candidateIds: string[];
    candidateNames: string[];
    averageSimilarity: number;
    riskLevel: string;
  }>;
  aiResults: Record<
    string,
    {
      aiProbability: number;
      verdict: string;
      reasons: string[];
    }
  >;
  pairwiseResults: Array<{
    candidateAId: string;
    candidateBId: string;
    similarityScore: number;
    verdict: string;
    matchedTiles: any[];
  }>;
}

export function Dashboard({ userName, onReset }: DashboardProps) {
  const [report, setReport] = useState<CohortReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDiff, setActiveDiff] = useState<any | null>(null);

  // Auto-load benchmark demo on mount so dashboard isn't blank
  useEffect(() => {
    loadDemoReport();
  }, []);

  const loadDemoReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      setReport(data.report);
      setReportId(data.reportId);
    } catch (err) {
      console.error('Failed to load demo report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setReportId(data.reportId);
      } else {
        alert(data.error || 'Failed to analyze files');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Ensure Fastify server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiff = async (candAId: string, candBId: string) => {
    if (!reportId) return;
    try {
      const res = await fetch(`/api/reports/${reportId}/compare?candA=${candAId}&candB=${candBId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveDiff(data);
      }
    } catch (err) {
      console.error('Failed to load diff comparison:', err);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-teal-400 p-[1.5px]">
            <div className="w-full h-full bg-[#0A0D14] rounded-[10px] flex items-center justify-center text-teal-300 font-black font-mono">
              ZX
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Zixie Assessment Hub
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Live Proctor
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Welcome back, <span className="text-slate-200 font-medium">{userName}</span> · Integrity Monitor Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDemoReport}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>Reload Benchmark Cohort</span>
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Upload Zone */}
      <div className="bg-slate-900/60 border border-dashed border-slate-700/80 hover:border-purple-500/50 rounded-2xl p-6 sm:p-8 text-center transition-all group backdrop-blur-sm">
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".zip,.js,.ts,.cpp,.java,.py"
        />
        <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Drop candidate submissions (.zip archive or multiple code files)
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports C++, Java, Python, and JavaScript/TypeScript
            </div>
          </div>
          <div className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-purple-300 font-medium hover:bg-slate-700 transition-colors">
            {loading ? 'Analyzing ASTs & Winnowing...' : 'Browse Local Files'}
          </div>
        </label>
      </div>

      {/* Metrics Row */}
      {report && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Candidates</span>
              <FileCode className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {report.summary.totalCandidates}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {report.summary.totalComparisons} Pairwise comparisons
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Avg Similarity</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-300">
              {Math.round(report.summary.averageSimilarity * 100)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Cohort baseline spread
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Collusion Rings</span>
              <Users className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {report.summary.collusionRingsCount}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1">
              Active cheating clusters
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">AI Flagged</span>
              <Bot className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-teal-300">
              {report.summary.aiFlaggedCount}
            </div>
            <div className="text-[11px] text-teal-400/80 mt-1">
              High LLM generation probability
            </div>
          </div>
        </div>
      )}

      {/* Detected Collusion Rings Cards */}
      {report && report.collusionRings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Detected Cheating Rings (Union-Find Clusters)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.collusionRings.map((ring) => (
              <div
                key={ring.ringId}
                className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3 shadow-lg shadow-rose-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wide">
                    Collusion Cluster #{ring.ringId}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {Math.round(ring.averageSimilarity * 100)}% Match
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-400">Involved Candidates: </span>
                  <span className="font-semibold text-white">
                    {ring.candidateNames.join(', ')}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenDiff(ring.candidateIds[0], ring.candidateIds[1])}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect Ring Diff</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Assessment Table */}
      {report && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Candidate Integrity Roster</h3>
            <span className="text-xs text-slate-400 font-mono">
              {report.nodes.length} Total Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-3 font-medium">Candidate</th>
                  <th className="px-6 py-3 font-medium">File</th>
                  <th className="px-6 py-3 font-medium">Collusion Status</th>
                  <th className="px-6 py-3 font-medium">AI Generation Score</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.nodes.map((cand) => {
                  const ai = report.aiResults[cand.id];
                  const inCluster = cand.clusterId !== undefined;

                  return (
                    <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-white">
                        {cand.candidateName}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-400">
                        {cand.filename}
                      </td>
                      <td className="px-6 py-3.5">
                        {inCluster ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Ring #{cand.clusterId} Member
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            <CheckCircle className="w-3 h-3 text-teal-400" />
                            Clear
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 max-w-[160px]">
                          <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cand.aiProbability >= 0.7
                                  ? 'bg-rose-500'
                                  : cand.aiProbability >= 0.4
                                  ? 'bg-amber-400'
                                  : 'bg-teal-400'
                              }`}
                              style={{ width: `${Math.round(cand.aiProbability * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-300 w-8">
                            {Math.round(cand.aiProbability * 100)}%
                          </span>
                        </div>
                        {ai && ai.reasons.length > 0 && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                            {ai.reasons[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {report.pairwiseResults
                          .filter((p) => p.candidateAId === cand.id || p.candidateBId === cand.id)
                          .filter((p) => p.similarityScore >= 0.5)
                          .slice(0, 1)
                          .map((p) => {
                            const otherId = p.candidateAId === cand.id ? p.candidateBId : p.candidateAId;
                            return (
                              <button
                                key={p.candidateAId + p.candidateBId}
                                onClick={() => handleOpenDiff(cand.id, otherId)}
                                className="px-3 py-1 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 transition-colors font-medium text-[11px] cursor-pointer"
                              >
                                View Diff ({Math.round(p.similarityScore * 100)}%)
                              </button>
                            );
                          })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Synchronized Diff Modal */}
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
