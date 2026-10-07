import React, { useState } from 'react';
import { Shield, KeyRound, Mail, User, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (userName: string) => void;
  onBack: () => void;
}

export function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Abhijeet');
  const [email, setEmail] = useState('recruiter@company.com');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(name.trim() || 'Recruiter');
  };

  const handleQuickDemo = () => {
    onSuccess('Abhijeet');
  };

  return (
    <div className="relative z-10 w-full max-w-md animate-fade-in px-4">
      {/* Header / Logo */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 items-center justify-center text-purple-400 mb-1">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to Zixie</h2>
        <p className="text-sm text-slate-400">Sign in to your assessment workspace</p>
      </div>

      {/* Auth Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl mb-6 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abhijeet"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <span>{tab === 'signin' ? 'Sign In to Workspace' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
          >
            1-Click Demo Login →
          </button>
        </div>
      </div>
    </div>
  );
}
