import {
  CandidateSubmission,
  SimilarityResult,
  AiDetectionResult,
} from '../types.js';
import { compareSubmissions } from '../index.js';
import { detectAiGeneratedCode } from '../ai-detector/ai-detector.js';
import {
  buildCollusionClusters,
  CohortAnalysisReport,
} from '../clustering/graph-clustering.js';

export interface BatchAnalysisOptions {
  kGramSize?: number;
  windowSize?: number;
  minTileLength?: number;
  suspiciousThreshold?: number;
  collusionThreshold?: number;
}

/**
 * Executes cohort-wide batch analysis across all submitted candidate files.
 */
export function analyzeCandidateCohort(
  candidates: CandidateSubmission[],
  options: BatchAnalysisOptions = {}
): CohortAnalysisReport {
  const { collusionThreshold = 0.70 } = options;

  // 1. Run AI detection on each individual candidate
  const aiResults: Record<string, AiDetectionResult> = {};
  let aiFlaggedCount = 0;

  for (const cand of candidates) {
    const aiResult = detectAiGeneratedCode(cand.id, cand.sourceCode);
    aiResults[cand.id] = aiResult;
    if (aiResult.verdict === 'AI_GENERATED_LIKELY') {
      aiFlaggedCount++;
    }
  }

  // 2. Compute pairwise similarity across all N*(N-1)/2 combinations
  const pairwiseResults: SimilarityResult[] = [];
  let totalScoreSum = 0;
  let flaggedPairsCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const pair = compareSubmissions(candidates[i], candidates[j], options);
      pairwiseResults.push(pair);
      totalScoreSum += pair.similarityScore;

      if (pair.verdict !== 'CLEAR') {
        flaggedPairsCount++;
      }
    }
  }

  const totalComparisons = pairwiseResults.length;
  const averageSimilarity =
    totalComparisons > 0
      ? Math.round((totalScoreSum / totalComparisons) * 1000) / 1000
      : 0;

  // 3. Run graph clustering & collusion ring extraction
  const { nodes, edges, collusionRings } = buildCollusionClusters(
    candidates,
    pairwiseResults,
    aiResults,
    collusionThreshold
  );

  return {
    summary: {
      totalCandidates: candidates.length,
      totalComparisons,
      averageSimilarity,
      flaggedPairsCount,
      collusionRingsCount: collusionRings.length,
      aiFlaggedCount,
    },
    nodes,
    edges,
    collusionRings,
    aiResults,
    pairwiseResults,
  };
}
