export * from './types.js';
export { tokenizeAndNormalize } from './normalizer/tokenizer.js';
export { winnow, calculateFingerprintSimilarity } from './winnowing/winnowing.js';
export { greedyStringTiling } from './tiling/rkr-gst.js';
export { detectAiGeneratedCode } from './ai-detector/ai-detector.js';

import { CandidateSubmission, SimilarityResult } from './types.js';
import { tokenizeAndNormalize } from './normalizer/tokenizer.js';
import { winnow, calculateFingerprintSimilarity } from './winnowing/winnowing.js';
import { greedyStringTiling } from './tiling/rkr-gst.js';

export const ENGINE_VERSION = '0.1.0';

/**
 * Compares two candidate submissions and returns full similarity metrics and matched code tiles.
 */
export function compareSubmissions(
  candA: CandidateSubmission,
  candB: CandidateSubmission,
  options: {
    kGramSize?: number;
    windowSize?: number;
    minTileLength?: number;
    suspiciousThreshold?: number;
    collusionThreshold?: number;
  } = {}
): SimilarityResult {
  const {
    kGramSize = 8,
    windowSize = 6,
    minTileLength = 5,
    suspiciousThreshold = 0.55,
    collusionThreshold = 0.80,
  } = options;

  // 1. Tokenize and normalize both files
  const normA = tokenizeAndNormalize(candA.sourceCode);
  const normB = tokenizeAndNormalize(candB.sourceCode);

  // 2. Winnowing fingerprints
  const fpA = winnow(normA.tokens, kGramSize, windowSize);
  const fpB = winnow(normB.tokens, kGramSize, windowSize);
  const winnowingScore = calculateFingerprintSimilarity(fpA, fpB);

  // 3. Greedy String Tiling (RKR-GST)
  const { tiles: matchedTiles, similarity: tilingScore } = greedyStringTiling(
    normA.tokens,
    normB.tokens,
    minTileLength
  );

  // 4. Combined weighted similarity score
  // RKR-GST accounts for 65% (exact structural tiles), Winnowing 35%
  const similarityScore = Math.min(
    1.0,
    Math.round((0.35 * winnowingScore + 0.65 * tilingScore) * 1000) / 1000
  );

  // 5. Determine integrity verdict
  let verdict: 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED' = 'CLEAR';
  if (similarityScore >= collusionThreshold) {
    verdict = 'COLLUSION_DETECTED';
  } else if (similarityScore >= suspiciousThreshold) {
    verdict = 'SUSPICIOUS';
  }

  return {
    candidateAId: candA.id,
    candidateBId: candB.id,
    similarityScore,
    winnowingScore: Math.round(winnowingScore * 1000) / 1000,
    tilingScore: Math.round(tilingScore * 1000) / 1000,
    matchedTiles,
    verdict,
  };
}
