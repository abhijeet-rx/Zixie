import { Play, RotateCcw, Search, Sun, Moon, Laptop, Loader2 } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';

interface NavbarProps {
  caseId: string;
  userName: string;
  isLoading: boolean;
  onReloadBenchmark: () => void;
  onResetSession: () => void;
  onOpenCommandPalette: () => void;
  onSwitchToStitch?: () => void;
}

export function Navbar({
  caseId,
  userName,
  isLoading,
  onReloadBenchmark,
  onResetSession,
  onOpenCommandPalette,
  onSwitchToStitch,
}: NavbarProps) {
  const { theme, setTheme, resolved } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-z-border bg-z-bg/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Dossier Metadata */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-md bg-z-surface-1 border border-z-border-strong flex items-center justify-center shrink-0 shadow-z-sm">
            <span className="font-mono text-xs font-black tracking-widest text-z-accent">ZX</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight text-z-text-primary">
                ZIXIE
              </span>
              <span className="hidden sm:inline-block text-z-text-muted text-xs">/</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded bg-z-surface-2 text-z-text-secondary border border-z-border">
                {caseId}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-z-clear-subtle text-z-clear-text border border-[var(--z-clear)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--z-clear)] animate-pulse" />
                Live Proctor
              </span>
            </div>
            <p className="text-[11px] text-z-text-muted truncate hidden md:block">
              Investigator: <span className="text-z-text-secondary font-medium">{userName}</span> · AST Winnowing & Stylometric Graph Engine
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-z-surface-1 hover:bg-z-surface-2 border border-z-border text-z-text-secondary hover:text-z-text-primary text-xs font-mono transition-colors shadow-z-sm"
            title="Open command palette (Ctrl+K / Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-z-text-muted" />
            <span>Search roster...</span>
            <kbd className="text-[10px] bg-z-surface-2 px-1.5 py-0.5 rounded border border-z-border text-z-text-muted font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Reload Benchmark Cohort */}
          <Tooltip content="Re-run pipeline on the benchmark plagiarism & collusion dataset">
            <Button
              variant="secondary"
              size="sm"
              onClick={onReloadBenchmark}
              disabled={isLoading}
              className="font-mono text-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-z-accent" />
              ) : (
                <Play className="w-3.5 h-3.5 text-z-accent" />
              )}
              <span className="hidden sm:inline">Benchmark Cohort</span>
            </Button>
          </Tooltip>

          {/* Switch to Stitch Academic UI */}
          {onSwitchToStitch && (
            <Tooltip content="Switch to Stitch Academic Workspace (Light Mode)">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSwitchToStitch}
                className="font-mono text-xs flex items-center gap-1.5"
              >
                <span>🎓</span>
                <span className="hidden md:inline">Academic Mode</span>
              </Button>
            </Tooltip>
          )}

          {/* Theme Switcher */}
          <Tooltip content={`Theme: ${theme} (click to cycle)`}>
            <button
              type="button"
              onClick={cycleTheme}
              className="w-8 h-8 rounded-md bg-z-surface-1 hover:bg-z-surface-2 border border-z-border flex items-center justify-center text-z-text-secondary hover:text-z-text-primary transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'system' ? (
                <Laptop className="w-3.5 h-3.5" />
              ) : resolved === 'dark' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </button>
          </Tooltip>

          {/* Reset / Sign Out */}
          <Tooltip content="End session and return to launch screen">
            <button
              type="button"
              onClick={onResetSession}
              className="w-8 h-8 rounded-md bg-z-surface-1 hover:bg-z-surface-2 border border-z-border flex items-center justify-center text-z-text-muted hover:text-z-text-primary transition-colors cursor-pointer"
              aria-label="Reset session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
