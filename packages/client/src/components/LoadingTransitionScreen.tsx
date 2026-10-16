import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingTransitionScreenProps {
  userName: string;
  onComplete: () => void;
}

export function LoadingTransitionScreen({ userName, onComplete }: LoadingTransitionScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState('Verifying credentials & cryptographic proctor keys...');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setCurrentStep(2);
      setStatusMessage('Initializing AST Lexical Normalizer & Winnowing k-gram indices...');
    }, 500);

    const t2 = setTimeout(() => {
      setProgress(80);
      setCurrentStep(3);
      setStatusMessage('Loading candidate answer evaluation workspace & folders...');
    }, 1100);

    const t3 = setTimeout(() => {
      setProgress(100);
      setCurrentStep(4);
      setStatusMessage('Workspace ready! Launching dashboard...');
    }, 1600);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center p-4 font-sans select-none animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.08)] p-7 sm:p-8 space-y-6 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-ping" />
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/25 relative z-10">
            Z
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Preparing Answer Evaluation Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Welcome back, <span className="font-semibold text-blue-600">{userName}</span>
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium truncate pr-2 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </span>
            <span className="font-mono font-bold text-blue-600 shrink-0">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Checklist */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-left text-xs font-mono">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proctor Session Handshake</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">VERIFIED</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              {currentStep >= 2 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              )}
              <span>AST Tokenizer &amp; Winnowing</span>
            </span>
            <span className={`text-[10px] font-bold ${currentStep >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {currentStep >= 2 ? 'READY' : 'LOADING'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              {currentStep >= 3 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
              )}
              <span>Answer Folders &amp; Heuristics</span>
            </span>
            <span className={`text-[10px] font-bold ${currentStep >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {currentStep >= 3 ? 'READY' : 'QUEUED'}
            </span>
          </div>
        </div>

        {/* Quick Skip button */}
        <div className="pt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onComplete}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Skip loading &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
