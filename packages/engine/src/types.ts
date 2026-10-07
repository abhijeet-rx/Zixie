export interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

export interface NormalizedCode {
  tokens: Token[];
  tokenString: string;
  sourceLines: string[];
}

export interface Fingerprint {
  hash: number;
  position: number; // Token index
  line: number;
}

export interface MatchTile {
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  tokenCount: number;
  sourceTokenIndex: number;
  targetTokenIndex: number;
}

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  filename: string;
  language: string;
  sourceCode: string;
  submittedAt?: string;
}

export interface SimilarityResult {
  candidateAId: string;
  candidateBId: string;
  similarityScore: number; // 0.0 - 1.0
  winnowingScore: number;
  tilingScore: number;
  matchedTiles: MatchTile[];
  verdict: 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED';
}

export interface AiDetectionResult {
  candidateId: string;
  aiProbability: number; // 0.0 - 1.0
  reasons: string[];
  heuristicIndicators: {
    verboseDocstrings: boolean;
    uniformCommentDensity: boolean;
    canonicalNamingPattern: boolean;
    lowEntropyFormatting: boolean;
    standardAiBoilerplate: boolean;
  };
  verdict: 'HUMAN_LIKELY' | 'SUSPICIOUS' | 'AI_GENERATED_LIKELY';
}
