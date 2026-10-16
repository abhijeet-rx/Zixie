import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface AssessmentsScreenProps {
  onNavigate: (href: string) => void;
}

interface AssessmentItem {
  id: string;
  title: string;
  code: string;
  term: string;
  language: string;
  dueDate: string;
  submissionsCount: number;
  expectedCount: number;
  status: 'TRIAGE' | 'COMPLETED' | 'UPCOMING';
  flaggedCount: number;
  avgSimilarity: number;
  starterCodeExcluded: boolean;
}

export function AssessmentsScreen({ onNavigate }: AssessmentsScreenProps) {
  const [filter, setFilter] = useState<'ALL' | 'TRIAGE' | 'COMPLETED' | 'UPCOMING'>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('Java');

  const [assessments, setAssessments] = useState<AssessmentItem[]>([
    {
      id: 'proj-2',
      title: 'Project 2: Self-Balancing AVL & Red-Black Trees',
      code: 'CS61B-SP26-P2',
      term: 'Spring 2026',
      language: 'Java',
      dueDate: 'Oct 14, 2026',
      submissionsCount: 120,
      expectedCount: 128,
      status: 'TRIAGE',
      flaggedCount: 5,
      avgSimilarity: 34,
      starterCodeExcluded: true,
    },
    {
      id: 'exam-1',
      title: 'Midterm Coding Exam: Algorithmic Efficiency & Recursion',
      code: 'CS61B-SP26-MID1',
      term: 'Spring 2026',
      language: 'Python',
      dueDate: 'Oct 02, 2026',
      submissionsCount: 86,
      expectedCount: 86,
      status: 'COMPLETED',
      flaggedCount: 1,
      avgSimilarity: 28,
      starterCodeExcluded: true,
    },
    {
      id: 'lab-4',
      title: 'Lab 4: Cache-Oblivious Matrix Multiplication',
      code: 'CS61B-SP26-L4',
      term: 'Spring 2026',
      language: 'C++',
      dueDate: 'Sep 24, 2026',
      submissionsCount: 142,
      expectedCount: 142,
      status: 'COMPLETED',
      flaggedCount: 0,
      avgSimilarity: 19,
      starterCodeExcluded: true,
    },
    {
      id: 'proj-3',
      title: 'Project 3: Distributed Raft Consensus Key-Value Engine',
      code: 'CS61B-SP26-P3',
      term: 'Spring 2026',
      language: 'Go',
      dueDate: 'Nov 12, 2026',
      submissionsCount: 0,
      expectedCount: 130,
      status: 'UPCOMING',
      flaggedCount: 0,
      avgSimilarity: 0,
      starterCodeExcluded: false,
    },
  ]);

  const filteredAssessments = assessments.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.language.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newItem: AssessmentItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      code: `CS61B-SP26-CUSTOM`,
      term: 'Spring 2026',
      language: newLang,
      dueDate: 'Nov 20, 2026',
      submissionsCount: 8,
      expectedCount: 120,
      status: 'TRIAGE',
      flaggedCount: 2,
      avgSimilarity: 31,
      starterCodeExcluded: true,
    };
    setAssessments([newItem, ...assessments]);
    setShowCreateModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
              COURSE: CS 61B
            </span>
            <span className="text-xs text-slate-500">Term: Spring 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>Course Assessments &amp; Exams</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage assignment integrity rules, starter code exemptions, and plagiarism scans.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Toolbar: Search & Status Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assessment name, code, language..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('TRIAGE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'TRIAGE'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            In Triage (1)
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Completed (2)
          </button>
          <button
            type="button"
            onClick={() => setFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Upcoming (1)
          </button>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAssessments.map((item) => {
          const isTriage = item.status === 'TRIAGE';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {item.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                      {item.title}
                    </h2>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isTriage
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Language
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {item.language}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Submissions
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {item.submissionsCount} / {item.expectedCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Flagged
                    </span>
                    <span
                      className={`font-bold mt-0.5 block ${
                        item.flaggedCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {item.flaggedCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Avg Match
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {item.avgSimilarity}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {item.dueDate}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Starter code ignored</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/submissions')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('/similarity')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Similarity Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/reports')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Dossier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <span>Create New Assessment</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project 3: Distributed Hash Map"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Primary Language
                </label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Go">Go</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Starter Code Boilerplate URL (Git Repository)
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/cs61b-sp26/proj3-skeleton"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Skeleton code will be stripped from AST tokenization to prevent false-positive matches.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
