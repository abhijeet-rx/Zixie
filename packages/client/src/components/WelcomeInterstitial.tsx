import { useEffect, useState } from 'react';
import { Terminal, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeInterstitialProps {
  userName: string;
  onProceed: () => void;
}

export function WelcomeInterstitial({ userName, onProceed }: WelcomeInterstitialProps) {
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Verifying proctor credentials...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(60);
      setStatusText('Loading AST tokenizers & Winnowing heuristics...');
    }, 700);

    const t2 = setTimeout(() => {
      setProgress(100);
      setStatusText('Workspace ready. Launching dashboard...');
    }, 1400);

    const t3 = setTimeout(() => {
      onProceed();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onProceed]);

  return (
    <div className="relative z-10 max-w-lg w-full text-center space-y-7 animate-fade-in px-4">
      {/* Animated Glowing Ring Icon */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-purple-600/30 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 p-[1.5px] shadow-xl">
          <div className="w-full h-full bg-[#0A0D14] rounded-[14px] flex items-center justify-center text-teal-300">
            <Sparkles className="w-8 h-8 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      </div>

      {/* Greeting Animation */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">{userName}</span>,
        </h2>
        <p className="text-xl sm:text-2xl font-light text-slate-300">
          Let's start now.
        </p>
      </div>

      {/* Progress card */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            {statusText}
          </span>
          <span className="text-teal-400 font-semibold">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            Fastify API connected
          </span>
          <button
            onClick={onProceed}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <span>Skip wait</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
