import { SimilarityResult, CandidateSubmission, AiDetectionResult } from '../types.js';

export interface GraphNode {
  id: string;
  label: string;
  candidateName: string;
  filename: string;
  aiProbability: number;
  aiVerdict: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  clusterId?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  similarityScore: number;
  verdict: 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED';
}

export interface CollusionRing {
  ringId: number;
  candidateIds: string[];
  candidateNames: string[];
  averageSimilarity: number;
  riskLevel: 'HIGH';
}

export interface CohortAnalysisReport {
  summary: {
    totalCandidates: number;
    totalComparisons: number;
    averageSimilarity: number;
    flaggedPairsCount: number;
    collusionRingsCount: number;
    aiFlaggedCount: number;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  collusionRings: CollusionRing[];
  aiResults: Record<string, AiDetectionResult>;
  pairwiseResults: SimilarityResult[];
}

/**
 * Union-Find (Disjoint-Set) data structure for identifying cheating rings
 */
class UnionFind {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  constructor(ids: string[]) {
    for (const id of ids) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  find(x: string): string {
    const p = this.parent.get(x);
    if (!p) {
      this.parent.set(x, x);
      return x;
    }
    if (p !== x) {
      this.parent.set(x, this.find(p));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return;

    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
  }
}

/**
 * Clusters pairwise similarity results into network graph and collusion rings.
 */
export function buildCollusionClusters(
  candidates: CandidateSubmission[],
  pairwiseResults: SimilarityResult[],
  aiResults: Record<string, AiDetectionResult>,
  collusionThreshold = 0.70
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  collusionRings: CollusionRing[];
} {
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const uf = new UnionFind(candidates.map((c) => c.id));

  // 1. Identify suspicious & collusion edges
  const edges: GraphEdge[] = [];
  const colludingPairs: SimilarityResult[] = [];

  for (const pair of pairwiseResults) {
    if (pair.similarityScore >= 0.40) {
      edges.push({
        id: `edge-${pair.candidateAId}-${pair.candidateBId}`,
        source: pair.candidateAId,
        target: pair.candidateBId,
        similarityScore: pair.similarityScore,
        verdict: pair.verdict,
      });
    }

    if (pair.similarityScore >= collusionThreshold) {
      uf.union(pair.candidateAId, pair.candidateBId);
      colludingPairs.push(pair);
    }
  }

  // 2. Group candidates into connected components
  const groups = new Map<string, string[]>();
  for (const cand of candidates) {
    const root = uf.find(cand.id);
    if (!groups.has(root)) {
      groups.set(root, []);
    }
    groups.get(root)!.push(cand.id);
  }

  // 3. Extract rings with 2 or more candidates that exceeded threshold
  const collusionRings: CollusionRing[] = [];
  let ringIndex = 1;

  const candidateToRingMap = new Map<string, number>();

  for (const [, memberIds] of groups.entries()) {
    if (memberIds.length >= 2) {
      // Confirm that members have actual collusion edges between them
      const ringScores: number[] = [];
      for (const pair of colludingPairs) {
        if (memberIds.includes(pair.candidateAId) && memberIds.includes(pair.candidateBId)) {
          ringScores.push(pair.similarityScore);
        }
      }

      if (ringScores.length > 0) {
        const avgSim =
          ringScores.reduce((acc, s) => acc + s, 0) / ringScores.length;

        for (const id of memberIds) {
          candidateToRingMap.set(id, ringIndex);
        }

        collusionRings.push({
          ringId: ringIndex,
          candidateIds: memberIds,
          candidateNames: memberIds.map((id) => candidateMap.get(id)?.candidateName || id),
          averageSimilarity: Math.round(avgSim * 1000) / 1000,
          riskLevel: 'HIGH',
        });

        ringIndex++;
      }
    }
  }

  // 4. Construct visual nodes
  const nodes: GraphNode[] = candidates.map((c) => {
    const ai = aiResults[c.id];
    const inRing = candidateToRingMap.has(c.id);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (inRing || (ai && ai.verdict === 'AI_GENERATED_LIKELY')) {
      riskLevel = 'HIGH';
    } else if (ai && ai.verdict === 'SUSPICIOUS') {
      riskLevel = 'MEDIUM';
    }

    return {
      id: c.id,
      label: c.candidateName,
      candidateName: c.candidateName,
      filename: c.filename,
      aiProbability: ai ? ai.aiProbability : 0,
      aiVerdict: ai ? ai.verdict : 'HUMAN_LIKELY',
      riskLevel,
      clusterId: candidateToRingMap.get(c.id),
    };
  });

  return { nodes, edges, collusionRings };
}
