import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<'hero' | 'auth' | 'welcome' | 'dashboard'>('hero');

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {stage === 'hero' && (
        <div className="max-w-2xl text-center space-y-6 z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI & Code Collusion Inspector</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
            Cheating? <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400">Not anymore.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
            Zixie detects structural code plagiarism, cheating rings, and AI-generated submissions for technical assessments in real-time.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setStage('auth')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/25 transition-all cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
