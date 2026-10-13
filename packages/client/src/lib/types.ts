/**
 * Re-export engine types for client-side use.
 * These are the canonical data shapes — do not re-declare locally.
 */
export type {
  Token,
  NormalizedCode,
  Fingerprint,
  MatchTile,
  CandidateSubmission,
  SimilarityResult,
  AiDetectionResult,
  GraphNode,
  GraphEdge,
  CollusionRing,
  CohortAnalysisReport,
  BatchAnalysisOptions,
} from '@zixie/engine';

/* ═══════════════════════════════════════════
   CLIENT-ONLY TYPES
   ═══════════════════════════════════════════ */

/** API response from GET /api/demo and POST /api/analyze */
export interface AnalysisResponse {
  reportId: string;
  candidates: import('@zixie/engine').CandidateSubmission[];
  report: import('@zixie/engine').CohortAnalysisReport;
}

/** API response from GET /api/reports/:id/compare */
export interface CompareResponse {
  candA: {
    id: string;
    candidateName: string;
    filename: string;
    sourceCode: string;
  };
  candB: {
    id: string;
    candidateName: string;
    filename: string;
    sourceCode: string;
  };
  comparison: import('@zixie/engine').SimilarityResult;
}

/** API response from GET /api/reports/:id */
export interface StoredSession {
  reportId: string;
  createdAt: string;
  candidates: import('@zixie/engine').CandidateSubmission[];
  report: import('@zixie/engine').CohortAnalysisReport;
}

/** Application routing stages */
export type AppStage = 'landing' | 'auth' | 'welcome' | 'dashboard';

/** Dashboard sub-views */
export type DashboardView = 'overview' | 'diff';

/** Risk level type alias */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** Verdict types */
export type SimilarityVerdict = 'CLEAR' | 'SUSPICIOUS' | 'COLLUSION_DETECTED';
export type AiVerdict = 'HUMAN_LIKELY' | 'SUSPICIOUS' | 'AI_GENERATED_LIKELY';
