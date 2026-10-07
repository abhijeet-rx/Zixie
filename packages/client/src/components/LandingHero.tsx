import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Terminal, Users } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  const [headlineStage, setHeadlineStage] = useState<'question' | 'answer'>('question');

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeadlineStage('answer');
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 max-w-3xl text-center space-y-8 animate-fade-in px-4">
      {/* Top pill badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-wide shadow-inner shadow-purple-900/30">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Next-Gen Code Integrity Engine</span>
      </div>

      {/* Main Animated Headline */}
      <div className="space-y-2 min-h-[140px] flex flex-col justify-center items-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Cheating?{' '}
          <span
            className={`inline-block transition-all duration-700 ${
              headlineStage === 'answer'
                ? 'opacity-100 translate-y-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400'
                : 'opacity-0 translate-y-4'
            }`}
          >
            Not anymore.
          </span>
        </h1>
      </div>

      {/* Subtext */}
      <p className="text-slate-400 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
        Zixie uncovers hidden collusion rings, variable-renamed plagiarism, and AI-generated code across remote technical coding tests in milliseconds.
      </p>

      {/* Core Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto text-left">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">MOSS & RKR-GST</div>
            <div className="text-[11px] text-slate-400">Deep String Tiling</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Collusion Rings</div>
            <div className="text-[11px] text-slate-400">Graph Clustering</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">AI Detection</div>
            <div className="text-[11px] text-slate-400">Stylometric Scans</div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-base shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-200 cursor-pointer"
        >
          <span>Launch Zixie</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
