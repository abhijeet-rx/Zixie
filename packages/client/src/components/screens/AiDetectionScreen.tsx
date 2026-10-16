import { useState } from 'react';
import {
  Bot,
  Sparkles,
  Cpu,
  Zap,
} from 'lucide-react';
import type { CohortAnalysisReport } from '@/lib/types';

interface AiDetectionScreenProps {
  report?: CohortAnalysisReport | null;
}

export function AiDetectionScreen({ report: _report }: AiDetectionScreenProps) {
  const [testCode, setTestCode] = useState<string>(
    `# Solution G: Red-Black Tree Balancing Helper
def balance_node(node):
    """
    Ensures Red-Black tree invariants are preserved following node insertion.
    Performs left and right rotations and color-flipping as appropriate.
    
    Parameters:
        node (Node): The subtree root to re-balance.
    Returns:
        Node: The balanced subtree root.
    """
    if is_red(node.right) and not is_red(node.left):
        node = rotate_left(node)
    if is_red(node.left) and is_red(node.left.left):
        node = rotate_right(node)
    if is_red(node.left) and is_red(node.right):
        flip_colors(node)
    return node`
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    probability: number;
    model: string;
    perplexity: number;
    burstiness: number;
    docstringUniformity: number;
    verdict: string;
  }>({
    probability: 94.2,
    model: 'OpenAI GPT-4o / Codex',
    perplexity: 11.4,
    burstiness: 18.2,
    docstringUniformity: 98.0,
    verdict: 'High Confidence Synthetic Code',
  });

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Simulate real-time forensic AI detection heuristics
      const hasDocstring = testCode.includes('"""') || testCode.includes('/**');
      const prob = hasDocstring ? 92.5 : 45.0;
      setAiResult({
        probability: prob,
        model: prob > 70 ? 'OpenAI GPT-4o / Claude 3.5 Sonnet' : 'Human Author / Baseline',
        perplexity: prob > 70 ? 12.8 : 48.5,
        burstiness: prob > 70 ? 21.0 : 64.2,
        docstringUniformity: hasDocstring ? 96.4 : 32.0,
        verdict: prob > 70 ? 'High Confidence Synthetic Code' : 'Clean Human Variations',
      });
      setAnalyzing(false);
    }, 600);
  };

  const aiRoster = [
    {
      id: 'cand_07',
      name: 'Grace Hopper',
      filename: 'grace_solution.py',
      probability: 94,
      model: 'GPT-4o',
      flags: ['Over-structured docstrings', 'Low token perplexity (11.4)', 'Zero syntax typos'],
      risk: 'HIGH',
    },
    {
      id: 'cand_02',
      name: 'Bob Chen',
      filename: 'bob_rbt.py',
      probability: 42,
      model: 'GitHub Copilot Autocomplete',
      flags: ['Assisted inline boilerplate completions', 'Human control flow'],
      risk: 'MEDIUM',
    },
    {
      id: 'cand_05',
      name: 'Eve Adams',
      filename: 'eve_adams_hw2.py',
      probability: 14,
      model: 'None (Human)',
      flags: ['Idiosyncratic variable names', 'High burstiness entropy'],
      risk: 'LOW',
    },
    {
      id: 'cand_01',
      name: 'Alice Smith',
      filename: 'alice_solution.py',
      probability: 8,
      model: 'None (Human)',
      flags: ['Natural debugging revisions', 'Organic naming variations'],
      risk: 'LOW',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700">
              SYNTHETIC CODE INTELLIGENCE
            </span>
            <span className="text-xs text-slate-500">Perplexity &amp; Burstiness Model v2.4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-purple-600" />
            <span>AI Code Generation &amp; LLM Fingerprinting</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detect code produced by ChatGPT, GitHub Copilot, and Claude via token predictability and structural entropy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Model Detection Active</span>
          </span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cohort AI Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">12.5%</span>
            <span className="text-xs font-medium text-amber-600">1 of 8 Flagged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Submissions exceeding 80% synthetic confidence
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mean Token Perplexity
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">42.8</span>
            <span className="text-xs font-medium text-emerald-600">Healthy Cohort</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Baseline natural coding variance (&lt;15 indicates LLM generation)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Suspect LLM Families
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">GPT-4o &bull; Claude 3.5</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Prompt styling matches code generation templates
          </p>
        </div>
      </div>

      {/* Interactive AI Code Inspector Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Interactive AI Forensic Sandbox</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Paste student source code or test candidate snippets against statistical language models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Code input (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative">
              <textarea
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                rows={11}
                className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner resize-y leading-relaxed"
                placeholder="Paste code to evaluate for AI fingerprints..."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {testCode.length} characters • Python
              </span>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Analyzing Token Distribution...' : 'Run Forensic Heuristic Scan'}</span>
              </button>
            </div>
          </div>

          {/* Heuristic Scores Result (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Detection Verdict
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {aiResult.verdict}
                </span>
                <span className="text-xs text-purple-600 font-medium">
                  {aiResult.model}
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-purple-600">
                  {aiResult.probability}%
                </span>
                <span className="text-[10px] text-slate-400 block">AI Probability</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Token Perplexity (Low = LLM)</span>
                  <span className="font-mono font-bold text-slate-800">{aiResult.perplexity} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(aiResult.perplexity * 2, 100)}%` }}
                    className="bg-purple-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Burstiness &amp; Line Entropy</span>
                  <span className="font-mono font-bold text-slate-800">{aiResult.burstiness}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${aiResult.burstiness}%` }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Docstring Syntax Uniformity</span>
                  <span className="font-mono font-bold text-slate-800">{aiResult.docstringUniformity}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${aiResult.docstringUniformity}%` }}
                    className="bg-amber-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/80 border border-purple-200 text-[11px] text-purple-900 leading-relaxed">
              <strong>Forensic Note:</strong> The code structure demonstrates consistent parameter docstring formatting, standardized indent spacing, and zero exploratory variable re-assignments commonly found in human problem-solving.
            </div>
          </div>
        </div>
      </div>

      {/* Cohort AI Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Cohort AI Detection Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Students whose answers exhibit statistical anomalies or LLM patterns.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">File</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">AI Confidence</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Suspected Signature</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Key Forensic Signals</th>
                <th className="px-4 py-3 text-right font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiRoster.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{item.filename}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono font-bold ${
                        item.probability >= 80
                          ? 'text-purple-600 text-sm'
                          : item.probability >= 30
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {item.probability}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.model}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.risk === 'HIGH'
                          ? 'bg-purple-100 text-purple-800'
                          : item.risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.risk}
                    </span>
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
