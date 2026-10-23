export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface HealthResponse {
  status: "healthy" | "degraded";
  database?: string;
  message?: string;
}

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  filename: string;
  language: string;
  sourceCode: string;
  submittedAt?: string;
}

export interface MatchedTile {
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  tokenCount: number;
}

export type PairVerdict = "CLEAR" | "SUSPICIOUS" | "COLLUSION_DETECTED";

export interface PairSimilarityResult {
  candidateAId: string;
  candidateBId: string;
  similarityScore: number;
  winnowingScore: number;
  tilingScore: number;
  matchedTiles: MatchedTile[];
  verdict: PairVerdict;
}

export type AiVerdict = "HUMAN_LIKELY" | "SUSPICIOUS" | "AI_GENERATED_LIKELY";

export interface AiSignalFlags {
  verboseDocstrings: boolean;
  uniformCommentDensity: boolean;
  canonicalNamingPattern: boolean;
  lowEntropyFormatting: boolean;
  standardAiBoilerplate: boolean;
}

export interface AiDetectionResult {
  candidateId: string;
  aiProbability: number;
  reasons: string[];
  flags: AiSignalFlags;
  verdict: AiVerdict;
}

export interface CollusionCluster {
  id: string;
  candidateIds: string[];
  maxSimilarity: number;
  averageSimilarity: number;
}

export interface AnalysisReport {
  generatedAt?: string;
  pairResults: PairSimilarityResult[];
  aiResults: AiDetectionResult[];
  clusters: CollusionCluster[];
}

export interface BatchReportPayload {
  reportId: string;
  candidates: CandidateSubmission[];
  report: AnalysisReport;
  source: "live" | "demo";
}
