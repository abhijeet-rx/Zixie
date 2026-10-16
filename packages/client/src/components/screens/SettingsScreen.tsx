import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  CheckCircle2,
  Shield,
  Cpu,
  Save,
  RotateCcw,
} from 'lucide-react';

export function SettingsScreen() {
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(75);
  const [medRiskThreshold, setMedRiskThreshold] = useState<number>(50);
  const [kGramSize, setKGramSize] = useState<number>(12);
  const [ignoreStarterCode, setIgnoreStarterCode] = useState<boolean>(true);
  const [normalizeIdentifiers, setNormalizeIdentifiers] = useState<boolean>(true);
  const [aiStrictness, setAiStrictness] = useState<'BALANCED' | 'STRICT' | 'CONSERVATIVE'>('BALANCED');
  const [anonymizeGrading, setAnonymizeGrading] = useState<boolean>(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedToast('Algorithmic thresholds and institutional policies updated successfully!');
      setTimeout(() => setSavedToast(null), 4000);
    }, 600);
  };

  const handleReset = () => {
    setHighRiskThreshold(75);
    setMedRiskThreshold(50);
    setKGramSize(12);
    setIgnoreStarterCode(true);
    setNormalizeIdentifiers(true);
    setAiStrictness('BALANCED');
    setAnonymizeGrading(false);
    setEmailAlerts(true);
    setSavedToast('Restored default departmental integrity thresholds.');
    setTimeout(() => setSavedToast(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {savedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
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
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs text-slate-500">Forensics &amp; Policy Tuning</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Algorithmic &amp; Institutional Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Calibrate AST winnowing thresholds, AI detection sensitivity, and student privacy controls.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Algorithmic Sensitivity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Similarity Engine &amp; AST Sensitivity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control the mathematical cutoffs that flag submissions for plagiarism review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* High-risk slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  High Risk (Red Flag) Threshold
                </label>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {highRiskThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Submissions matching at or above this score are escalated directly to lead instructors.
              </span>
            </div>

            {/* Medium-risk slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Medium Risk (Attention) Threshold
                </label>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  {medRiskThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="65"
                step="1"
                value={medRiskThreshold}
                onChange={(e) => setMedRiskThreshold(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Submissions in this range undergo routine TA manual review.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                K-gram Token Window Size
              </label>
              <input
                type="number"
                min="4"
                max="32"
                value={kGramSize}
                onChange={(e) => setKGramSize(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block">
                Length of contiguous token rolling hashes in winnowing pass.
              </span>
            </div>

            <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreStarterCode}
                onChange={(e) => setIgnoreStarterCode(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Ignore Skeleton Code</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Strips template files to eliminate false matches.
                </span>
              </div>
            </label>

            <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={normalizeIdentifiers}
                onChange={(e) => setNormalizeIdentifiers(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Normalize Identifiers</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Maps variable renaming permutations into canonical AST nodes.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: AI Detection & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <span>AI Detection Strictness</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tune LLM token predictability evaluation model.
              </p>
            </div>

            <div className="space-y-2">
              {(['CONSERVATIVE', 'BALANCED', 'STRICT'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    aiStrictness === mode
                      ? 'border-purple-600 bg-purple-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="aiStrictness"
                      value={mode}
                      checked={aiStrictness === mode}
                      onChange={() => setAiStrictness(mode)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-900">{mode}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {mode === 'CONSERVATIVE'
                      ? 'Flag only >90% confidence'
                      : mode === 'BALANCED'
                      ? 'Standard heuristic blend'
                      : 'Flag even minor Copilot suggestions'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy & FERPA Compliance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>FERPA &amp; Student Privacy</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect student identities and comply with institutional privacy mandates.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={anonymizeGrading}
                  onChange={(e) => setAnonymizeGrading(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Blind Triage (Mask Student Names)</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Displays anonymous IDs until a formal misconduct report is authorized.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Real-Time Collusion Ring Alerts</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Dispatches instant email summary whenever a ring &ge; 3 students is discovered.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
