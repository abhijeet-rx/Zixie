import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail, School, Sparkles } from 'lucide-react';

interface StitchAuthScreenProps {
  onSuccess: (userName: string) => void;
}

export function StitchAuthScreen({ onSuccess }: StitchAuthScreenProps) {
  const [email, setEmail] = useState('abhijeet.ta@university.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = email.split('@')[0] || 'Abhijeet';
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    onSuccess(formatted);
  };

  const handleQuickDemo = () => {
    onSuccess('Abhijeet (Head TA)');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Minimal Top Nav */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
            Z
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
              Zixie
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Academic Integrity &amp; Proctoring
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems Operational
          </span>
        </div>
      </header>

      {/* Center Card Area */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[460px] flex flex-col items-center">
          {/* Main Authentication Card */}
          <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] p-8 sm:p-10 transition-all">
            {/* Header & Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-100 shadow-sm">
                <School className="w-6 h-6" />
              </div>
              <h1 className="font-bold text-2xl text-slate-900 tracking-tight font-sans">
                Instructor &amp; Grader Sign In
              </h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Access code similarity reports and cohort integrity analytics
              </p>
            </div>

            {/* Quick Demo Button banner */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-blue-950">Fast Benchmark Access</div>
                  <div className="text-[11px] text-blue-700">Enter as Head TA with CS401 cohort</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                1-Click Sign In
              </button>
            </div>

            {/* Standard Authentication Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  htmlFor="instructor-email"
                >
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="instructor-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prof.turing@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    htmlFor="instructor-password"
                  >
                    Secret Passkey
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuickDemo();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Use 1-Click Demo
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="instructor-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-slate-400">Level 4 Clearance</span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-600/25 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Verify Credentials &amp; Enter Workbench</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or Continue With SSO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Workspace</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Edu SAML SSO</span>
              </button>
            </div>
          </div>

          {/* Trust badges footer */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SOC-2 Type II Certified</span>
            </span>
            <span>•</span>
            <span>FERPA Compliant</span>
            <span>•</span>
            <span>256-bit AES Encryption</span>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/40">
        Zixie Integrity &copy; 2026 Abhijeet Singh · Built with Fastify, React &amp; Stitch
      </footer>
    </div>
  );
}
