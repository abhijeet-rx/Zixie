import { randomUUID } from 'node:crypto';
import type { CohortAnalysisReport, CandidateSubmission } from '@zixie/engine';
import { ReportModel } from '../models/report.js';

export interface StoredSession {
  reportId: string;
  ownerId: string;
  createdAt: Date;
  candidates: CandidateSubmission[];
  report: CohortAnalysisReport;
}

class ReportStore {
  async save(ownerId: string, candidates: CandidateSubmission[], report: CohortAnalysisReport): Promise<string> {
    const reportId = `rep_${randomUUID()}`;
    await ReportModel.create({ reportId, ownerId, candidates, report });
    return reportId;
  }

  async get(reportId: string, ownerId: string): Promise<StoredSession | null> {
    const stored = await ReportModel.findOne({ reportId, ownerId }).lean().exec();
    if (!stored) return null;
    return {
      reportId: stored.reportId,
      ownerId: stored.ownerId,
      createdAt: stored.createdAt,
      candidates: stored.candidates,
      report: stored.report,
    };
  }

  async getLatest(ownerId: string): Promise<StoredSession | null> {
    const stored = await ReportModel.findOne({ ownerId }).sort({ createdAt: -1 }).lean().exec();
    if (!stored) return null;
    return {
      reportId: stored.reportId,
      ownerId: stored.ownerId,
      createdAt: stored.createdAt,
      candidates: stored.candidates,
      report: stored.report,
    };
  }

  async deleteAll(ownerId: string): Promise<number> {
    const result = await ReportModel.deleteMany({ ownerId }).exec();
    return result.deletedCount;
  }
}

export const reportStore = new ReportStore();
