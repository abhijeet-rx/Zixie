import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3Force from 'd3-force';
import { Users, AlertTriangle, ExternalLink, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/cn';
import type { GraphNode, GraphEdge, CollusionRing } from '../../lib/types';

interface CollusionRingGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  collusionRings: CollusionRing[];
  onOpenDiff: (candAId: string, candBId: string) => void;
}

interface SimNode extends d3Force.SimulationNodeDatum {
  id: string;
  name: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  clusterId?: number;
  aiProbability: number;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  score: number;
  verdict: string;
}

export function CollusionRingGraph({
  nodes,
  edges,
  collusionRings,
  onOpenDiff,
}: CollusionRingGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Setup simulation nodes and links
  const graphData = useMemo(() => {
    const simNodes: SimNode[] = nodes.map((n) => ({
      id: n.id,
      name: n.candidateName,
      riskLevel: n.riskLevel,
      clusterId: n.clusterId,
      aiProbability: n.aiProbability,
    }));

    // Filter edges above baseline similarity threshold (e.g. > 0.20) for clarity
    const simLinks: SimLink[] = edges
      .filter((e) => e.similarityScore >= 0.25)
      .map((e) => ({
        source: e.source,
        target: e.target,
        score: e.similarityScore,
        verdict: e.verdict,
      }));

    return { nodes: simNodes, links: simLinks };
  }, [nodes, edges]);

  // Keep track of node positions rendered
  const [renderedNodes, setRenderedNodes] = useState<SimNode[]>([]);
  const [renderedLinks, setRenderedLinks] = useState<SimLink[]>([]);

  useEffect(() => {
    const width = 800;
    const height = 480;

    // Deep clone to avoid mutating React memoized state
    const simNodes: SimNode[] = graphData.nodes.map((d) => ({ ...d }));
    const simLinks: SimLink[] = graphData.links.map((d) => ({ ...d }));

    const simulation = d3Force
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3Force
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => 130 - (d.score || 0) * 80)
      )
      .force('charge', d3Force.forceManyBody().strength(-240))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide().radius(32))
      .stop();

    // Run simulation ticks synchronously for immediate layout
    for (let i = 0; i < 180; ++i) simulation.tick();

    setRenderedNodes([...simNodes]);
    setRenderedLinks([...simLinks]);

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // Connected node ids for hovered node
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>([hoveredNode]);
    for (const link of renderedLinks) {
      const sId = typeof link.source === 'object' ? link.source.id : link.source;
      const tId = typeof link.target === 'object' ? link.target.id : link.target;
      if (sId === hoveredNode) ids.add(tId as string);
      if (tId === hoveredNode) ids.add(sId as string);
    }
    return ids;
  }, [hoveredNode, renderedLinks]);

  return (
    <div className="space-y-6">
      {/* Collusion Rings Dossier Summary */}
      {collusionRings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-z-flagged" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-z-text-primary">
                Identified Collusion Clusters ({collusionRings.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-z-text-muted">
              Union-Find Disjoint Set Algorithm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {collusionRings.map((ring) => {
              const scorePct = Math.round(ring.averageSimilarity * 100);
              return (
                <div
                  key={ring.ringId}
                  className="bg-z-surface-1 border border-[var(--z-flagged)]/30 rounded-md p-4 sm:p-5 relative shadow-z-sm overflow-hidden group hover:border-[var(--z-flagged)]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-bold uppercase bg-z-flagged-subtle text-z-flagged-text border border-[var(--z-flagged)]/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cluster #{ring.ringId}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-z-surface-2 text-z-flagged-text border border-z-border">
                      {scorePct}% Avg Overlap
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-z-text-secondary">
                      <span className="text-z-text-muted font-mono text-[11px] uppercase mr-1">
                        Involved Candidates:
                      </span>
                      <span className="font-medium text-z-text-primary">
                        {ring.candidateNames.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-z-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-z-text-muted">
                      {ring.candidateIds.length} Linked Submissions
                    </span>
                    {ring.candidateIds.length >= 2 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-mono text-xs h-7 px-2.5"
                        onClick={() => onOpenDiff(ring.candidateIds[0], ring.candidateIds[1])}
                      >
                        <span>Inspect Pair Diff</span>
                        <ExternalLink className="w-3 h-3 text-z-accent" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Force-directed Topology SVG */}
      <div className="bg-z-surface-1 border border-z-border rounded-md p-4 sm:p-5 shadow-z-sm space-y-3">
        <div className="flex items-center justify-between border-b border-z-border pb-3">
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-z-text-primary">
              Submission Graph Topology
            </h4>
            <p className="text-[11px] text-z-text-muted font-mono">
              Edges indicate winnowing & AST similarity ≥ 25%. Node size proportional to risk.
            </p>
          </div>

          {/* Graph Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              className="p-1.5 rounded bg-z-surface-2 hover:bg-z-surface-3 text-z-text-secondary border border-z-border transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
              className="p-1.5 rounded bg-z-surface-2 hover:bg-z-surface-3 text-z-text-secondary border border-z-border transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded bg-z-surface-2 hover:bg-z-surface-3 text-z-text-secondary border border-z-border transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full h-[440px] sm:h-[480px] bg-z-surface-inset border border-z-border rounded overflow-hidden relative select-none">
          <svg
            ref={svgRef}
            viewBox="0 0 800 480"
            className="w-full h-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            <defs>
              <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="var(--z-border)" />
              </pattern>
            </defs>

            {/* Background grid */}
            <rect width="100%" height="100%" fill="url(#grid-dots)" />

            {/* Render Links */}
            <g className="links">
              {renderedLinks.map((link, idx) => {
                const source = link.source as SimNode;
                const target = link.target as SimNode;
                if (!source.x || !source.y || !target.x || !target.y) return null;

                const isConnected =
                  hoveredNode && (source.id === hoveredNode || target.id === hoveredNode);
                const isHighSim = link.score >= 0.6;

                return (
                  <line
                    key={`link-${idx}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={
                      isHighSim
                        ? 'var(--z-flagged)'
                        : isConnected
                        ? 'var(--z-accent)'
                        : 'var(--z-border-strong)'
                    }
                    strokeWidth={Math.max(1, (link.score || 0) * 4)}
                    strokeOpacity={hoveredNode ? (isConnected ? 0.9 : 0.15) : 0.6}
                    strokeDasharray={isHighSim ? '4,3' : undefined}
                    className="transition-opacity duration-200 cursor-pointer"
                    onClick={() => onOpenDiff(source.id, target.id)}
                  />
                );
              })}
            </g>

            {/* Render Nodes */}
            <g className="nodes">
              {renderedNodes.map((node) => {
                if (!node.x || !node.y) return null;

                const isHovered = hoveredNode === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isSelected = selectedNode === node.id;
                const inCluster = node.clusterId !== undefined;

                const nodeRadius = inCluster ? 18 : 14;

                const strokeColor =
                  node.riskLevel === 'HIGH'
                    ? 'var(--z-flagged)'
                    : node.riskLevel === 'MEDIUM'
                    ? 'var(--z-review)'
                    : 'var(--z-clear)';

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${node.x},${node.y})`}
                    className="cursor-pointer transition-opacity duration-200"
                    opacity={hoveredNode ? (isConnected ? 1 : 0.25) : 1}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    {/* Ring highlight halo if in collusion cluster */}
                    {inCluster && (
                      <circle
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="var(--z-flagged)"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        opacity={0.7}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={nodeRadius}
                      fill="var(--z-surface-1)"
                      stroke={strokeColor}
                      strokeWidth={isHovered || isSelected ? 3 : 2}
                    />

                    {/* Node Label Text */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      className="font-mono text-[9px] font-bold fill-[var(--z-text-primary)] pointer-events-none"
                    >
                      {node.name.slice(0, 2).toUpperCase()}
                    </text>

                    {/* Name tag below node */}
                    <text
                      textAnchor="middle"
                      dy={nodeRadius + 14}
                      className={cn(
                        'font-mono text-[10px] pointer-events-none transition-colors',
                        isHovered || inCluster
                          ? 'fill-[var(--z-text-primary)] font-semibold'
                          : 'fill-[var(--z-text-secondary)]'
                      )}
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Interactive Legend in Bottom Corner */}
          <div className="absolute bottom-3 right-3 p-2.5 rounded bg-z-surface-1/90 border border-z-border backdrop-blur-sm font-mono text-[10px] space-y-1.5 shadow-z-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--z-flagged)] bg-z-surface-1" />
              <span className="text-z-text-secondary">High Risk / Ring Member</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--z-review)] bg-z-surface-1" />
              <span className="text-z-text-secondary">Medium Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--z-clear)] bg-z-surface-1" />
              <span className="text-z-text-secondary">Clear Submission</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
