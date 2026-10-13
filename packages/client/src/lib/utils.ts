import type { RiskLevel, AiVerdict, SimilarityVerdict } from './types';

/**
 * Format a 0–1 score as a percentage string (e.g. 0.873 → "87%").
 */
export function formatPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format a 0–1 score as integer (e.g. 0.873 → 87).
 */
export function scoreToInt(score: number): number {
  return Math.round(score * 100);
}

/**
 * Generate a forensic case-file ID string.
 */
let caseCounter = 1;
export function generateCaseId(): string {
  const id = `CASE-${String(caseCounter).padStart(4, '0')}`;
  caseCounter++;
  return id;
}

/**
 * Get risk label with icon prefix for accessibility.
 */
export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':   return 'Flagged';
    case 'MEDIUM': return 'Review';
    case 'LOW':    return 'Clear';
  }
}

/**
 * Get verdict display text.
 */
export function verdictLabel(verdict: SimilarityVerdict): string {
  switch (verdict) {
    case 'COLLUSION_DETECTED': return 'Collusion Detected';
    case 'SUSPICIOUS':         return 'Suspicious';
    case 'CLEAR':              return 'Clear';
  }
}

/**
 * Get AI verdict display text.
 */
export function aiVerdictLabel(verdict: AiVerdict | string): string {
  switch (verdict) {
    case 'AI_GENERATED_LIKELY': return 'AI Generated';
    case 'SUSPICIOUS':          return 'Review';
    case 'HUMAN_LIKELY':        return 'Human Likely';
    default:                    return verdict;
  }
}

/**
 * Find the maximum similarity score for a candidate across all pairwise results.
 */
export function maxSimilarityForCandidate(
  candidateId: string,
  pairwiseResults: Array<{ candidateAId: string; candidateBId: string; similarityScore: number }>
): number {
  let max = 0;
  for (const pair of pairwiseResults) {
    if (pair.candidateAId === candidateId || pair.candidateBId === candidateId) {
      if (pair.similarityScore > max) max = pair.similarityScore;
    }
  }
  return max;
}

/**
 * Find the most similar partner for a given candidate.
 */
export function mostSimilarPartner(
  candidateId: string,
  pairwiseResults: Array<{ candidateAId: string; candidateBId: string; similarityScore: number }>
): { partnerId: string; score: number } | null {
  let best: { partnerId: string; score: number } | null = null;
  for (const pair of pairwiseResults) {
    if (pair.candidateAId === candidateId || pair.candidateBId === candidateId) {
      const partnerId = pair.candidateAId === candidateId ? pair.candidateBId : pair.candidateAId;
      if (!best || pair.similarityScore > best.score) {
        best = { partnerId, score: pair.similarityScore };
      }
    }
  }
  return best;
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}
