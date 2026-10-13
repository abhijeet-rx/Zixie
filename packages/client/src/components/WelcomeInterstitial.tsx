import { useEffect, useState } from 'react';
import { Terminal, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeInterstitialProps {
  userName: string;
  onProceed: () => void;
}

export function WelcomeInterstitial({ userName, onProceed }: WelcomeInterstitialProps) {
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Verifying proctor session & cryptographic keys...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(65);
      setStatusText('Pre-compiling AST tokenizers & Winnowing k-gram indices...');
    }, 700);

    const t2 = setTimeout(() => {
      setProgress(100);
      setStatusText('Forensic workspace initialized. Launching dashboard...');
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
    <div className="relative z-10 max-w-lg w-full mx-auto text-center space-y-8 animate-fade-in px-4 font-sans">
      {/* Forensic Seal Icon */}
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <div className="w-14 h-14 rounded-md bg-z-surface-1 border border-z-border flex items-center justify-center text-z-accent shadow-z-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
      </div>

      {/* Greeting with Instrument Serif */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-display tracking-tight text-z-text-primary">
          Welcome, <span className="italic text-z-accent">{userName}</span>
        </h2>
        <p className="text-sm font-mono text-z-text-secondary">
          Initializing Forensic Investigation Workspace
        </p>
      </div>

      {/* Pipeline Progress Dossier Card */}
      <div className="bg-z-surface-1 border border-z-border rounded-lg p-5 sm:p-6 shadow-z-md space-y-4 text-left font-mono text-xs">
        <div className="flex items-center justify-between text-z-text-secondary">
          <span className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-z-accent" />
            <span className="truncate max-w-[280px] sm:max-w-none">{statusText}</span>
          </span>
          <span className="text-z-accent font-bold tabular-nums ml-2">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-z-surface-inset rounded-full overflow-hidden border border-z-border-subtle">
          <div
            className="h-full bg-z-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps Status Checklist */}
        <div className="pt-2 border-t border-z-border space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-z-text-secondary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-z-clear" />
              <span>Fastify REST Server handshake</span>
            </span>
            <span className="text-z-clear">OK</span>
          </div>

          <div className="flex items-center justify-between text-z-text-secondary">
            <span className="flex items-center gap-1.5">
              {progress >= 65 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-z-clear" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-z-accent" />
              )}
              <span>Lexical Normalizer & AST Heuristics</span>
            </span>
            <span className={progress >= 65 ? 'text-z-clear' : 'text-z-text-muted'}>
              {progress >= 65 ? 'READY' : 'LOADING'}
            </span>
          </div>

          <div className="flex items-center justify-between text-z-text-secondary">
            <span className="flex items-center gap-1.5">
              {progress >= 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-z-clear" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-z-border inline-block" />
              )}
              <span>Stylometric Perplexity & Graph Clustering</span>
            </span>
            <span className={progress >= 100 ? 'text-z-clear' : 'text-z-text-muted'}>
              {progress >= 100 ? 'READY' : 'QUEUED'}
            </span>
          </div>
        </div>

        {/* Action Skip */}
        <div className="pt-3 border-t border-z-border flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onProceed}
            className="font-mono text-xs text-z-text-secondary hover:text-z-text-primary"
          >
            <span>Skip Wait</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
