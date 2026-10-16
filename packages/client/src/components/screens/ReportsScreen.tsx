import { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Shield,
  Printer,
} from 'lucide-react';
import type { CohortAnalysisReport } from '@/lib/types';

interface ReportsScreenProps {
  report?: CohortAnalysisReport | null;
}

export function ReportsScreen({ report: _report }: ReportsScreenProps) {
  const [downloading, setDownloading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [includeDiffs, setIncludeDiffs] = useState(true);
  const [anonymize, setAnonymize] = useState(false);
  const [includeAi, setIncludeAi] = useState(true);
  const [includeCollusion, setIncludeCollusion] = useState(true);

  const pastReports = [
    {
      id: 'rep-01',
      title: 'Honor Committee Formal Misconduct Packet #2026-SP-04',
      assessment: 'Project 2: Self-Balancing Trees',
      format: 'PDF (Archival)',
      author: 'Abhijeet (Head TA)',
      timestamp: 'Oct 15, 2026 18:42',
      hash: 'sha256:4b9a...7e21',
      size: '2.4 MB',
    },
    {
      id: 'rep-02',
      title: 'CS 61B Midterm 1 Full Cohort Similarity Matrix',
      assessment: 'Midterm 1: Python Algorithms',
      format: 'CSV (Data Grid)',
      author: 'Prof. John Doe',
      timestamp: 'Oct 04, 2026 11:20',
      hash: 'sha256:d8c1...904b',
      size: '412 KB',
    },
    {
      id: 'rep-03',
      title: 'FERPA-Compliant Cohort Anonymized Audit',
      assessment: 'Lab 4: Memory Management',
      format: 'PDF (Anonymized)',
      author: 'Abhijeet (Head TA)',
      timestamp: 'Sep 26, 2026 09:15',
      hash: 'sha256:e3fa...12cc',
      size: '1.8 MB',
    },
  ];

  const handleDownload = (format: string) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setSuccessToast(`Successfully compiled and exported ${format} Dossier!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
              AUDIT COMPLIANCE &amp; EXPORT
            </span>
            <span className="text-xs text-slate-500">FERPA &amp; Senate Standards</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Integrity Dossiers &amp; Formal Misconduct Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compile cryptographic evidence packets for academic integrity hearings and institutional reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleDownload('Academic Senate PDF')}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling PDF...' : 'Download Official Dossier (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Report Compiler Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Generate Customized Verification Dossier</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure data points, evidentiary diffs, and privacy redaction flags prior to compilation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={includeDiffs}
              onChange={(e) => setIncludeDiffs(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Side-by-Side Diffs</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Attach matched code lines with syntax highlighting
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={includeCollusion}
              onChange={(e) => setIncludeCollusion(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Collusion Clusters</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Multi-student network rings &amp; graph subtrees
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={includeAi}
              onChange={(e) => setIncludeAi(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">AI Code Forensics</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Perplexity heuristics and LLM model fingerprints
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={anonymize}
              onChange={(e) => setAnonymize(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">FERPA Anonymization</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Mask student IDs with pseudo-tokens (Cand_01)
              </span>
            </div>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Export target: <strong className="text-slate-800">Academic Senate Hearing Standard</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload('CSV Raw Matrix')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Export CSV Matrix
            </button>
            <button
              type="button"
              onClick={() => handleDownload('JSON Technical Audit')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Export JSON Audit
            </button>
            <button
              type="button"
              onClick={() => handleDownload('Official Dossier PDF')}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Packet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Generated Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Generated Report Archive &amp; Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of previously compiled dossiers with verification hashes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Report Title</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Assessment</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Format</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Generated By</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Timestamp</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Verification Hash</th>
                <th className="px-4 py-3 text-right font-bold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastReports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.assessment}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {item.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.author}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{item.timestamp}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{item.hash}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(item.title)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
