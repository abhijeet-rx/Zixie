import type { AnalysisResponse, CompareResponse } from './types';

const API_BASE = '/api';

/**
 * Fetch the benchmark demo report.
 */
export async function fetchDemoReport(): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/demo`);
  if (!res.ok) {
    throw new Error(`Demo request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<AnalysisResponse>;
}

/**
 * Upload files for analysis. Accepts a FileList or File array.
 */
export async function analyzeFiles(files: File[]): Promise<AnalysisResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `Analysis failed: ${res.status}`);
  }

  return res.json() as Promise<AnalysisResponse>;
}

/**
 * Compare two candidates in a report side-by-side.
 */
export async function fetchComparison(
  reportId: string,
  candAId: string,
  candBId: string
): Promise<CompareResponse> {
  const res = await fetch(
    `${API_BASE}/reports/${reportId}/compare?candA=${encodeURIComponent(candAId)}&candB=${encodeURIComponent(candBId)}`
  );

  if (!res.ok) {
    throw new Error(`Comparison failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<CompareResponse>;
}

/**
 * Fetch a stored report by ID.
 */
export async function fetchReport(reportId: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/reports/${reportId}`);
  if (!res.ok) {
    throw new Error(`Report fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<AnalysisResponse>;
}
