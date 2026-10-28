import { AnalysisReport, CandidateSubmission, HealthResponse, PairComparison, UserSession } from '../types/zixie';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const latestReportKey = 'zixie_latest_report_id';
// Keep API traffic same-origin in production. The frontend Vercel project
// rewrites /api/* to the API project, so the HttpOnly session cookie stays
// first-party instead of being blocked as a cross-site cookie.
const apiUrl = (path: string) => path;

function handleUnauthorized(): never {
  if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
    const returnUrl = window.location.pathname + window.location.search;
    window.sessionStorage.setItem('zixie_return_url', returnUrl);
    window.location.replace('/auth');
  }
  throw new ApiError('Unauthorized session. Redirecting to authentication.', 401);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body !== undefined && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) handleUnauthorized();
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message || body?.error || message;
    } catch {
      if (response.statusText) message = response.statusText;
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface EngineCandidate {
  id: string;
  candidateName: string;
  filename: string;
  language: string;
  sourceCode: string;
  submittedAt?: string;
}
interface EngineTile {
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  tokenCount: number;
}
interface EnginePair {
  candidateAId: string;
  candidateBId: string;
  similarityScore: number;
  winnowingScore: number;
  tilingScore: number;
  verdict: CandidateSubmission['verdict'];
  matchedTiles: EngineTile[];
}
interface EngineAnalysis {
  summary: { flaggedPairsCount: number; collusionRingsCount: number };
  nodes: Array<{ id: string; clusterId?: number }>;
  aiResults: Record<string, {
    aiProbability: number;
    heuristicIndicators: Record<string, boolean>;
  }>;
  pairwiseResults: EnginePair[];
}
export interface StoredReport {
  reportId: string;
  ownerId: string;
  createdAt: string;
  candidates: EngineCandidate[];
  report: EngineAnalysis;
}

const supportedLanguages = new Set<CandidateSubmission['language']>([
  'python', 'java', 'cpp', 'c', 'typescript', 'javascript', 'go',
]);

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function toAnalysisReport(stored: StoredReport): Promise<AnalysisReport> {
  const candidatesById = new Map(stored.candidates.map((candidate) => [candidate.id, candidate]));
  const pairs: PairComparison[] = stored.report.pairwiseResults.map((pair, pairIndex) => {
    const source = candidatesById.get(pair.candidateAId);
    const tiles = pair.matchedTiles.map((tile, tileIndex) => ({
      id: `${pair.candidateAId}-${pair.candidateBId}-${pairIndex}-${tileIndex}`,
      ...tile,
      snippet: source?.sourceCode.split(/\r?\n/).slice(tile.sourceStartLine - 1, tile.sourceEndLine).join('\n') || '',
    }));
    return {
      pairId: `${pair.candidateAId}-${pair.candidateBId}`,
      candidateAId: pair.candidateAId,
      candidateAName: source?.candidateName || pair.candidateAId,
      candidateBId: pair.candidateBId,
      candidateBName: candidatesById.get(pair.candidateBId)?.candidateName || pair.candidateBId,
      combinedScore: pair.similarityScore,
      winnowingScore: pair.winnowingScore,
      tilingScore: pair.tilingScore,
      verdict: pair.verdict,
      matchedTiles: tiles,
    };
  });

  const nodes = new Map(stored.report.nodes.map((node) => [node.id, node]));
  const candidates = await Promise.all(stored.candidates.map(async (candidate): Promise<CandidateSubmission> => {
    const related = pairs.filter((pair) => pair.candidateAId === candidate.id || pair.candidateBId === candidate.id)
      .sort((a, b) => b.combinedScore - a.combinedScore);
    const closest = related[0];
    const partnerId = closest
      ? closest.candidateAId === candidate.id ? closest.candidateBId : closest.candidateAId
      : null;
    const partner = partnerId ? candidatesById.get(partnerId) : null;
    const ai = stored.report.aiResults[candidate.id];
    const verdict = related.some((pair) => pair.verdict === 'COLLUSION_DETECTED')
      ? 'COLLUSION_DETECTED'
      : related.some((pair) => pair.verdict === 'SUSPICIOUS') ? 'SUSPICIOUS' : 'CLEAR';
    const language = supportedLanguages.has(candidate.language as CandidateSubmission['language'])
      ? candidate.language as CandidateSubmission['language'] : 'javascript';
    return {
      ...candidate,
      language,
      submittedAt: candidate.submittedAt || stored.createdAt,
      lineCount: candidate.sourceCode.split(/\r?\n/).length,
      sha256: await sha256(candidate.sourceCode),
      clusterId: nodes.get(candidate.id)?.clusterId == null ? null : String(nodes.get(candidate.id)?.clusterId),
      maxSimilarityScore: closest?.combinedScore || 0,
      mostSimilarPartnerId: partnerId,
      mostSimilarPartnerName: partner?.candidateName || null,
      verdict,
      winnowingScore: closest?.winnowingScore || 0,
      tilingScore: closest?.tilingScore || 0,
      aiProbability: ai?.aiProbability || 0,
      aiFlags: Object.entries(ai?.heuristicIndicators || {})
        .filter(([, enabled]) => enabled).map(([flag]) => flag) as CandidateSubmission['aiFlags'],
    };
  }));

  const collusionCount = pairs.filter((pair) => pair.verdict === 'COLLUSION_DETECTED').length;
  const suspiciousCount = pairs.filter((pair) => pair.verdict === 'SUSPICIOUS').length;
  const aiCount = candidates.filter((candidate) => candidate.aiProbability >= 0.45).length;
  return {
    reportId: stored.reportId,
    batchName: `Submission batch · ${new Date(stored.createdAt).toLocaleDateString()}`,
    createdAt: stored.createdAt,
    ownerId: stored.ownerId,
    totalSubmissions: candidates.length,
    flaggedCollusionCount: collusionCount,
    suspiciousPairCount: suspiciousCount,
    elevatedAiSignalCount: aiCount,
    clusterCount: stored.report.summary.collusionRingsCount,
    candidates,
    pairs,
  };
}

export const api = {
  checkHealth: async (): Promise<HealthResponse> => {
    const health = await request<{ status: string; database: string; timestamp: string }>('/api/health');
    return {
      status: health.status === 'healthy' ? 'ok' : 'degraded',
      database: health.database === 'connected' ? 'connected' : 'unavailable',
      timestamp: health.timestamp,
    };
  },

  getSession: (): Promise<{ user: UserSession }> => request<{ user: UserSession }>('/api/auth/me'),

  login: (email: string, password: string): Promise<{ user: UserSession }> =>
    request<{ user: UserSession }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string): Promise<{ user: UserSession }> =>
    request<{ user: UserSession }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  logout: (): Promise<void> => request<void>('/api/auth/logout', { method: 'POST' }),

  getLatestReport: async (): Promise<{ report: AnalysisReport | null }> => {
    try {
      const stored = await request<StoredReport>('/api/reports/latest');
      window.sessionStorage.setItem(latestReportKey, stored.reportId);
      return { report: await toAnalysisReport(stored) };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        window.sessionStorage.removeItem(latestReportKey);
        return { report: null };
      }
      throw error;
    }
  },

  deleteAllSubmissions: async (): Promise<{ deletedCount: number }> => {
    const result = await request<{ deletedCount: number }>('/api/reports', { method: 'DELETE' });
    window.sessionStorage.removeItem(latestReportKey);
    return result;
  },

  uploadSubmissions: (files: File[], onProgress?: (percent: number) => void): Promise<{ report: AnalysisReport }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      xhr.open('POST', apiUrl('/api/analyze'), true);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 401) {
          try { handleUnauthorized(); } catch (error) { reject(error); }
          return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          let message = `Upload failed (${xhr.status})`;
          try {
            const body = JSON.parse(xhr.responseText);
            message = body.message || body.error || message;
          } catch { /* use fallback */ }
          reject(new ApiError(message, xhr.status));
          return;
        }
        try {
          const stored = JSON.parse(xhr.responseText) as StoredReport & { reportId: string };
          window.sessionStorage.setItem(latestReportKey, stored.reportId);
          void toAnalysisReport({ ...stored, createdAt: stored.createdAt || new Date().toISOString() })
            .then((report) => resolve({ report }))
            .catch(reject);
        } catch (error) {
          reject(error instanceof ApiError ? error : new ApiError('Malformed response payload from analysis engine.', xhr.status));
        }
      };
      xhr.onerror = () => reject(new ApiError('Network error while uploading submission batch.', 0));
      xhr.send(formData);
    }),
};
