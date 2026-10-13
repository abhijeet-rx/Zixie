import React, { useState } from 'react';
import { Shield, KeyRound, Mail, User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

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
    <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12 animate-fade-in font-sans">
      {/* Official Header Seal */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex w-12 h-12 rounded-md bg-z-surface-1 border border-z-border items-center justify-center text-z-accent shadow-z-sm mb-1">
          <Shield className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-z-text-primary">
            Investigator Authentication
          </h2>
          <p className="text-xs text-z-text-muted font-mono">
            Proctor Security Gateway · Level 4 Clearance
          </p>
        </div>
      </div>

      {/* Main Dossier Form Card */}
      <div className="bg-z-surface-1 border border-z-border rounded-lg p-6 sm:p-7 shadow-z-md space-y-5">
        {/* Sign In / Sign Up Segmented Tabs */}
        <div className="grid grid-cols-2 p-1 bg-z-surface-2 rounded-md border border-z-border text-xs font-mono">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`py-1.5 rounded transition-colors cursor-pointer ${
              tab === 'signin'
                ? 'bg-z-surface-1 text-z-text-primary font-bold shadow-z-sm'
                : 'text-z-text-muted hover:text-z-text-secondary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`py-1.5 rounded transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'bg-z-surface-1 text-z-text-primary font-bold shadow-z-sm'
                : 'text-z-text-muted hover:text-z-text-secondary'
            }`}
          >
            Register Proctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-z-text-secondary font-medium mb-1.5 uppercase text-[10px] tracking-wider">
              Investigator Full Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-z-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abhijeet"
                className="w-full bg-z-surface-inset border border-z-border rounded-md pl-9 pr-3 py-2 text-xs text-z-text-primary placeholder:text-z-text-muted focus:outline-none focus:border-z-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-z-text-secondary font-medium mb-1.5 uppercase text-[10px] tracking-wider">
              Enterprise Work Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-z-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full bg-z-surface-inset border border-z-border rounded-md pl-9 pr-3 py-2 text-xs text-z-text-primary placeholder:text-z-text-muted focus:outline-none focus:border-z-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-z-text-secondary font-medium mb-1.5 uppercase text-[10px] tracking-wider">
              Secret Passkey
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-z-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-z-surface-inset border border-z-border rounded-md pl-9 pr-3 py-2 text-xs text-z-text-primary placeholder:text-z-text-muted focus:outline-none focus:border-z-accent transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2 font-mono text-xs justify-center"
          >
            <span>{tab === 'signin' ? 'Verify Credentials & Enter' : 'Create Proctor Dossier'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-3 border-t border-z-border flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={onBack}
            className="text-z-text-muted hover:text-z-text-primary flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-z-accent hover:text-z-accent-hover font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>1-Click Demo Login</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
