import { useEffect } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  User,
  Play,
  Sun,
  Moon,
  Laptop,
  RotateCcw,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../lib/theme';
import type { GraphNode } from '../../lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  onSelectCandidate: (candidateId: string) => void;
  onReloadBenchmark: () => void;
  onResetSession: () => void;
  onSwitchTab?: (tab: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  nodes,
  onSelectCandidate,
  onReloadBenchmark,
  onResetSession,
  onSwitchTab,
}: CommandPaletteProps) {
  const { setTheme } = useTheme();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-z-surface-1 border border-z-border rounded-lg shadow-z-lg overflow-hidden flex flex-col font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Forensic Command Palette" className="w-full">
          {/* Search Input Bar */}
          <div className="flex items-center px-3.5 border-b border-z-border bg-z-surface-2/60">
            <Search className="w-4 h-4 text-z-text-muted shrink-0 mr-2.5" />
            <Command.Input
              autoFocus
              placeholder="Type a candidate name, command, or view..."
              className="w-full py-3.5 bg-transparent text-z-text-primary placeholder:text-z-text-muted focus:outline-none font-mono text-xs"
            />
            <kbd className="text-[10px] text-z-text-muted px-1.5 py-0.5 rounded bg-z-surface-1 border border-z-border">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2">
            <Command.Empty className="py-6 text-center text-z-text-muted font-mono">
              No matching forensic records or commands.
            </Command.Empty>

            {/* Candidates Group */}
            {nodes.length > 0 && (
              <Command.Group heading="Candidate Submissions" className="text-z-text-muted text-[10px] uppercase px-2 py-1 font-semibold">
                {nodes.map((node) => {
                  const riskColor =
                    node.riskLevel === 'HIGH'
                      ? 'text-z-flagged-text'
                      : node.riskLevel === 'MEDIUM'
                      ? 'text-z-review-text'
                      : 'text-z-clear-text';

                  return (
                    <Command.Item
                      key={node.id}
                      value={`${node.candidateName} ${node.filename}`}
                      onSelect={() => {
                        onSelectCandidate(node.id);
                        onClose();
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer transition-colors text-xs font-sans aria-selected:bg-z-surface-2"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-z-text-muted" />
                        <span className="font-medium">{node.candidateName}</span>
                        <span className="font-mono text-[10px] text-z-text-muted">
                          ({node.filename})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className={riskColor}>{node.riskLevel}</span>
                        <span>AI: {Math.round(node.aiProbability * 100)}%</span>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* View Switching */}
            {onSwitchTab && (
              <Command.Group heading="Navigation Views" className="text-z-text-muted text-[10px] uppercase px-2 py-1 font-semibold">
                <Command.Item
                  value="roster candidates"
                  onSelect={() => {
                    onSwitchTab('roster');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
                >
                  <User className="w-3.5 h-3.5 text-z-accent" />
                  <span>View Candidate Integrity Roster</span>
                </Command.Item>
                <Command.Item
                  value="collusion network ring graph"
                  onSelect={() => {
                    onSwitchTab('network');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
                >
                  <Layers className="w-3.5 h-3.5 text-z-flagged" />
                  <span>View Collusion Rings Topology Graph</span>
                </Command.Item>
                <Command.Item
                  value="matrix heatmap pairwise"
                  onSelect={() => {
                    onSwitchTab('matrix');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
                >
                  <Layers className="w-3.5 h-3.5 text-z-accent" />
                  <span>View Pairwise Similarity Heatmap</span>
                </Command.Item>
                <Command.Item
                  value="upload submissions file"
                  onSelect={() => {
                    onSwitchTab('upload');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-z-text-muted" />
                  <span>Upload New Submissions</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Pipeline Commands */}
            <Command.Group heading="Pipeline Operations" className="text-z-text-muted text-[10px] uppercase px-2 py-1 font-semibold">
              <Command.Item
                value="reload benchmark cohort demo"
                onSelect={() => {
                  onReloadBenchmark();
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
              >
                <Play className="w-3.5 h-3.5 text-z-accent" />
                <span>Reload Benchmark Cohort Dataset</span>
              </Command.Item>
              <Command.Item
                value="switch dark theme mode"
                onSelect={() => {
                  setTheme('dark');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
              >
                <Moon className="w-3.5 h-3.5 text-z-text-muted" />
                <span>Theme: Dark Mode (Forensic Lab)</span>
              </Command.Item>
              <Command.Item
                value="switch light theme mode"
                onSelect={() => {
                  setTheme('light');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
              >
                <Sun className="w-3.5 h-3.5 text-z-text-muted" />
                <span>Theme: Light Mode (Paper Report)</span>
              </Command.Item>
              <Command.Item
                value="switch system theme mode"
                onSelect={() => {
                  setTheme('system');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-z-text-primary hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
              >
                <Laptop className="w-3.5 h-3.5 text-z-text-muted" />
                <span>Theme: System Default</span>
              </Command.Item>
              <Command.Item
                value="reset session logout exit"
                onSelect={() => {
                  onResetSession();
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-z-flagged-text hover:bg-z-surface-2 cursor-pointer text-xs aria-selected:bg-z-surface-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-z-flagged" />
                <span>Reset Session / Sign Out</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="px-3 py-2 bg-z-surface-2/40 border-t border-z-border flex items-center justify-between text-[10px] text-z-text-muted font-mono">
            <span>Navigate with ↑ ↓ and Press Enter</span>
            <span>ZIXIE Forensic Search</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
