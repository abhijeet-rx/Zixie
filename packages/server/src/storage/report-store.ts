import { CohortAnalysisReport, CandidateSubmission } from '@zixie/engine';

export interface StoredSession {
  reportId: string;
  createdAt: string;
  candidates: CandidateSubmission[];
  report: CohortAnalysisReport;
}

class ReportStore {
  private sessions = new Map<string, StoredSession>();

  save(candidates: CandidateSubmission[], report: CohortAnalysisReport): string {
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.sessions.set(reportId, {
      reportId,
      createdAt: new Date().toISOString(),
      candidates,
      report,
    });
    return reportId;
  }

  get(reportId: string): StoredSession | undefined {
    return this.sessions.get(reportId);
  }

  list(): Array<{ reportId: string; createdAt: string; totalCandidates: number; ringsCount: number }> {
    return Array.from(this.sessions.values()).map((s) => ({
      reportId: s.reportId,
      createdAt: s.createdAt,
      totalCandidates: s.report.summary.totalCandidates,
      ringsCount: s.report.summary.collusionRingsCount,
    }));
  }
}

export const reportStore = new ReportStore();
