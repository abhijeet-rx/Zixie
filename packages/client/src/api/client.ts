import {
  AnalysisReport,
  AuthUser,
  BatchReportPayload,
  CandidateSubmission,
  CollusionCluster,
  HealthResponse,
  PairSimilarityResult,
  AiDetectionResult,
} from "../types/zixie";

export const UPLOAD_FIELD_NAME = "files";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorizedCallback = handler;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new ApiError("Session expired or unauthorized. Please sign in.", 401);
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && ("error" in body || "message" in body)
        ? (body as Record<string, string>).error || (body as Record<string, string>).message
        : null) || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

function normalizeReport(raw: Record<string, unknown>): AnalysisReport {
  const rawPairs = (raw.pairResults ?? raw.pairs ?? raw.comparisons ?? []) as PairSimilarityResult[];
  const rawAi = (raw.aiResults ?? raw.aiSignals ?? raw.aiDetection ?? []) as AiDetectionResult[];
  const rawClusters = (raw.clusters ?? raw.collusionClusters ?? []) as Array<Record<string, unknown>>;

  const clusters: CollusionCluster[] = rawClusters.map((cluster, idx) => {
    const candidateIds = (cluster.candidateIds ?? cluster.memberIds ?? cluster.members ?? []) as string[];
    return {
      id: String(cluster.id ?? cluster.clusterId ?? `cluster-${idx + 1}`), candidateIds, maxSimilarity: Number(cluster.maxSimilarity ?? cluster.peakSimilarity ?? 0), averageSimilarity: Number(cluster.averageSimilarity ?? cluster.avgSimilarity ?? 0), }; });  return { generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(), pairResults: rawPairs, aiResults: rawAi, clusters, }; }  function normalizeBatchPayload( raw: Record<string, unknown>, source: "live" | "demo" ): BatchReportPayload { const reportId = String(raw.reportId ?? raw.id ?? (source === "demo" ? "demo-cohort" : "report")); const candidates = (raw.candidates ?? []) as CandidateSubmission[]; const reportObj = (raw.report ?? raw) as Record<string, unknown>; return { reportId, candidates, report: normalizeReport(reportObj), source, }; }  export const apiClient = { async getHealth(): Promise<HealthResponse> { try { const data = await request<Record<string, unknown>>("/api/health", { method: "GET" }); const status = data.status === "healthy" ? "healthy" : "degraded"; return { status, database: typeof data.database === "string" ? data.database : undefined, message: typeof data.message === "string" ? data.message : undefined, }; } catch (err) { return { status: "degraded", message: err instanceof Error ? err.message : "Health check unreachable", }; } },  async getMe(): Promise<AuthUser> { const data = await request<Record<string, unknown>>("/api/auth/me", { method: "GET" }); const user = (data.user ?? data) as Record<string, unknown>; return { id: String(user.id ?? user._id ?? ""), name: String(user.name ?? "Reviewer"), email: String(user.email ?? ""), }; },  async login(email: string, password: string): Promise<AuthUser> { const data = await request<Record<string, unknown>>("/api/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }), }); const user = (data.user ?? data) as Record<string, unknown>; return { id: String(user.id ?? user._id ?? ""), name: String(user.name ?? email.split("@")[0]), email: String(user.email ?? email), }; },  async register(name: string, email: string, password: string): Promise<AuthUser> { const data = await request<Record<string, unknown>>("/api/auth/register", { method: "POST", body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, }), }); const user = (data.user ?? data) as Record<string, unknown>; return { id: String(user.id ?? user._id ?? ""), name: String(user.name ?? name), email: String(user.email ?? email), }; },  async logout(): Promise<void> { await request("/api/auth/logout", { method: "POST" }); },  async fetchDemoReport(): Promise<BatchReportPayload> { const raw = await request<Record<string, unknown>>("/api/demo", { method: "GET" }); return normalizeBatchPayload(raw, "demo"); },  async fetchReportById(reportId: string): Promise<BatchReportPayload> { const raw = await request<Record<string, unknown>>( `/api/reports/${encodeURIComponent(reportId)}`,
      { method: "GET" }
    );
    return normalizeBatchPayload(raw, "live");
  },

  async analyzeSubmissions(files: File[]): Promise<BatchReportPayload> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(UPLOAD_FIELD_NAME, file, file.name);
    });
    const raw = await request<Record<string, unknown>>("/api/analyze", {
      method: "POST",
      body: formData,
    });
    return normalizeBatchPayload(raw, "live");
  },

  async compareCandidates(
    reportId: string,
    candidateAId: string,
    candidateBId: string
  ): Promise<PairSimilarityResult> {
    const params = new URLSearchParams({
      candidateA: candidateAId,
      candidateB: candidateBId,
    });
    const raw = await request<Record<string, unknown>>(
      `/api/reports/${encodeURIComponent(reportId)}/compare?${params.toString()}`,
      { method: "GET" }
    );
    const pair = (raw.comparison ?? raw.pair ?? raw) as PairSimilarityResult;
    return pair;
  },
};
