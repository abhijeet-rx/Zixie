export const ENGINE_VERSION = '0.1.0';

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  filename: string;
  language: string;
  sourceCode: string;
  submittedAt?: string;
}

export interface MatchTile {
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  tokenCount: number;
}

export interface SimilarityResult {
  candidateAId: string;
  candidateBId: string;
  similarityScore: number; // 0.0 - 1.0
  matchedTiles: MatchTile[];
  verdict: 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED';
}

export interface AiDetectionResult {
  candidateId: string;
  aiProbability: number; // 0.0 - 1.0
  heuristicIndicators: {
    verboseDocstrings: boolean;
    uniformCommentDensity: boolean;
    canonicalNamingPattern: boolean;
    lowEntropyFormatting: boolean;
  };
  verdict: 'HUMAN_LIKELY' | 'SUSPICIOUS' | 'AI_GENERATED_LIKELY';
}
