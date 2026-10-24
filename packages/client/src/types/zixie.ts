export type VerdictType = 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED';

export type AiHeuristicFlag =
  | 'verboseDocstrings'
  | 'uniformCommentDensity'
  | 'canonicalNamingPattern'
  | 'lowEntropyFormatting'
  | 'standardAiBoilerplate';

export interface MatchedTile {
  id: string;
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  tokenCount: number;
  snippet: string;
}

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  filename: string;
  language: 'python' | 'java' | 'cpp' | 'c' | 'typescript' | 'javascript' | 'go';
  submittedAt: string;
  sourceCode: string;
  lineCount: number;
  sha256: string;
  clusterId: string | null;
  maxSimilarityScore: number;
  mostSimilarPartnerId: string | null;
  mostSimilarPartnerName: string | null;
  verdict: VerdictType;
  winnowingScore: number;
  tilingScore: number;
  aiProbability: number; // 0 to 1
  aiFlags: AiHeuristicFlag[];
}

export interface PairComparison {
  pairId: string;
  candidateAId: string;
  candidateAName: string;
  candidateBId: string;
  candidateBName: string;
  combinedScore: number; // 0 to 1
  winnowingScore: number; // 0 to 1
  tilingScore: number; // 0 to 1
  verdict: VerdictType;
  matchedTiles: MatchedTile[];
}

export interface AnalysisReport {
  reportId: string;
  batchName: string;
  createdAt: string;
  ownerId: string;
  totalSubmissions: number;
  flaggedCollusionCount: number;
  suspiciousPairCount: number;
  elevatedAiSignalCount: number;
  clusterCount: number;
  candidates: CandidateSubmission[];
  pairs: PairComparison[];
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  institution: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'connected' | 'unavailable';
  timestamp: string;
}
