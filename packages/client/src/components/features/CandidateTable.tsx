import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  SplitSquareVertical,
  Bot,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { RiskBadge } from './RiskBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { RiskLevel } from '../../lib/types';

export interface CandidateRow {
  id: string;
  candidateName: string;
  filename: string;
  riskLevel: RiskLevel;
  clusterId?: number;
  aiProbability: number;
  aiVerdict: string;
  aiReasons: string[];
  topPeerId?: string;
  topPeerName?: string;
  topPeerScore?: number;
}

interface CandidateTableProps {
  candidates: CandidateRow[];
  onOpenDiff: (candAId: string, candBId: string) => void;
}

export function CandidateTable({ candidates, onOpenDiff }: CandidateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'riskLevel', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter candidates by riskLevel if filter applied
  const filteredData = useMemo(() => {
    if (riskFilter === 'ALL') return candidates;
    return candidates.filter((c) => c.riskLevel === riskFilter);
  }, [candidates, riskFilter]);

  const columns = useMemo<ColumnDef<CandidateRow>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          const isExpanded = !!expandedRows[row.original.id];
          return (
            <button
              type="button"
              onClick={() => toggleExpand(row.original.id)}
              className="p-1 rounded hover:bg-z-surface-3 text-z-text-muted hover:text-z-text-primary transition-colors cursor-pointer"
              aria-label={isExpanded ? 'Collapse row details' : 'Expand row details'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          );
        },
        size: 32,
      },
      {
        accessorKey: 'candidateName',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-z-text-primary transition-colors text-left cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Candidate Dossier</span>
            <ArrowUpDown className="w-3 h-3 text-z-text-muted" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-z-text-primary text-xs sm:text-sm">
              {row.original.candidateName}
            </span>
            <span className="font-mono text-[10px] text-z-text-muted">
              REF #{row.original.id.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'filename',
        header: 'Submission File',
        cell: ({ row }) => {
          const ext = row.original.filename.split('.').pop() || '';
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-z-text-secondary">
                {row.original.filename}
              </span>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-z-surface-2 text-z-text-muted border border-z-border">
                {ext}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'clusterId',
        header: 'Collusion Cluster',
        cell: ({ row }) => {
          const inCluster = row.original.clusterId !== undefined;
          if (inCluster) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] bg-z-flagged-subtle text-z-flagged-text border border-[var(--z-flagged)]/20 font-medium">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Ring #{row.original.clusterId}</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] text-z-text-muted">
              <CheckCircle className="w-3 h-3 text-z-clear" />
              <span>Independent</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'aiProbability',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-z-text-primary transition-colors text-left cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Stylometric AI</span>
            <ArrowUpDown className="w-3 h-3 text-z-text-muted" />
          </button>
        ),
        cell: ({ row }) => {
          const pct = Math.round(row.original.aiProbability * 100);
          const isHigh = row.original.aiProbability >= 0.7;
          const isMed = row.original.aiProbability >= 0.4 && !isHigh;

          return (
            <div className="flex items-center gap-2.5 min-w-[130px]">
              <div className="w-16 h-1.5 bg-z-surface-inset rounded-full overflow-hidden border border-z-border-subtle">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isHigh
                      ? 'bg-[var(--z-flagged)]'
                      : isMed
                      ? 'bg-[var(--z-review)]'
                      : 'bg-[var(--z-clear)]'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={cn(
                  'font-mono text-xs font-semibold tabular-nums w-8',
                  isHigh ? 'text-z-flagged-text' : isMed ? 'text-z-review-text' : 'text-z-text-secondary'
                )}
              >
                {pct}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'riskLevel',
        header: 'Risk Verdict',
        cell: ({ row }) => <RiskBadge level={row.original.riskLevel} />,
      },
      {
        id: 'actions',
        header: () => <span className="text-right block">Forensic Actions</span>,
        cell: ({ row }) => {
          const hasTopPeer = !!row.original.topPeerId && (row.original.topPeerScore ?? 0) > 0.15;
          if (!hasTopPeer) {
            return (
              <span className="text-right block text-[11px] font-mono text-z-text-muted">
                No major overlap
              </span>
            );
          }

          const peerScorePct = Math.round((row.original.topPeerScore ?? 0) * 100);

          return (
            <div className="flex items-center justify-end">
              <Button
                variant="secondary"
                size="sm"
                className="font-mono text-xs h-7 px-2.5"
                onClick={() => onOpenDiff(row.original.id, row.original.topPeerId!)}
              >
                <SplitSquareVertical className="w-3 h-3 text-z-accent" />
                <span>Diff vs {row.original.topPeerName?.split(' ')[0]}</span>
                <span className="text-z-accent font-semibold">{peerScorePct}%</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [expandedRows, onOpenDiff]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-z-surface-1 border border-z-border rounded-md overflow-hidden shadow-z-sm">
      {/* Control Bar: Search + Risk Filter Chips */}
      <div className="p-3.5 sm:p-4 border-b border-z-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-z-surface-2/40">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-z-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter candidates or filenames..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-z-surface-1 border border-z-border text-xs text-z-text-primary placeholder:text-z-text-muted focus:outline-none focus:border-z-accent transition-colors font-mono"
          />
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="z-label mr-1 hidden md:inline">Verdict:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setRiskFilter(lvl)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer',
                riskFilter === lvl
                  ? 'bg-z-surface-3 text-z-text-primary border border-z-border-strong font-semibold'
                  : 'text-z-text-muted hover:text-z-text-secondary hover:bg-z-surface-2'
              )}
            >
              {lvl === 'ALL' ? 'All' : lvl === 'HIGH' ? 'Flagged' : lvl === 'MEDIUM' ? 'Review' : 'Clear'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-z-border bg-z-surface-2/70 text-z-text-secondary">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-mono font-medium tracking-wide uppercase text-[11px]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-z-border-subtle font-sans">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-z-text-muted font-mono">
                  No candidate submissions match your query.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isExpanded = !!expandedRows[row.original.id];
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-z-surface-2/50 transition-colors group',
                      isExpanded && 'bg-z-surface-2/30'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Render Expanded Rows Details Drawer */}
      {table.getRowModel().rows.map((row) => {
        const isExpanded = !!expandedRows[row.original.id];
        if (!isExpanded) return null;

        const { original } = row;
        return (
          <div
            key={`detail-${original.id}`}
            className="p-4 sm:p-5 bg-z-surface-inset border-t border-b border-z-border space-y-3 font-sans text-xs animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-z-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-z-accent" />
                <span className="font-mono font-semibold text-z-text-primary uppercase tracking-wide text-xs">
                  Forensic Stylometry & Structural Analysis Dossier
                </span>
              </div>
              <Badge variant="muted" className="font-mono text-[10px]">
                ID: {original.id}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Detection Breakdown */}
              <div className="p-3 bg-z-surface-1 rounded border border-z-border space-y-2">
                <div className="flex items-center justify-between text-z-text-secondary text-[11px] font-mono">
                  <span>AI Probability Indicator:</span>
                  <span className="font-bold text-z-text-primary">
                    {Math.round(original.aiProbability * 100)}% ({original.aiVerdict})
                  </span>
                </div>
                {original.aiReasons.length > 0 ? (
                  <ul className="space-y-1 text-z-text-secondary text-xs">
                    {original.aiReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-z-accent font-mono text-[10px] mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-z-text-muted text-xs">
                    No anomalous stylometric identifiers or synthetic LLM markers detected.
                  </p>
                )}
              </div>

              {/* Collusion & Peer Overlap Details */}
              <div className="p-3 bg-z-surface-1 rounded border border-z-border space-y-2">
                <div className="flex items-center justify-between text-z-text-secondary text-[11px] font-mono">
                  <span>Peer Overlap & AST Tile Correlation:</span>
                  <Layers className="w-3.5 h-3.5 text-z-text-muted" />
                </div>
                {original.topPeerId ? (
                  <div className="space-y-2">
                    <div className="text-z-text-secondary text-xs">
                      Primary matching submission:{' '}
                      <span className="font-semibold text-z-text-primary">{original.topPeerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-mono text-xs"
                        onClick={() => onOpenDiff(original.id, original.topPeerId!)}
                      >
                        <SplitSquareVertical className="w-3.5 h-3.5 text-z-accent" />
                        <span>Launch Full Side-by-Side Diff Inspector</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-z-text-muted text-xs">
                    No significant winnowing hashes or AST subtrees shared with other submissions.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-z-surface-2/40 border-t border-z-border flex items-center justify-between text-[11px] font-mono text-z-text-muted">
        <span>Showing {table.getRowModel().rows.length} of {candidates.length} candidates</span>
        <span>Click any row chevron to inspect deep stylometric indicators</span>
      </div>
    </div>
  );
}
