import mongoose from 'mongoose';
import type { CandidateSubmission, CohortAnalysisReport } from '@zixie/engine';

export interface ReportRecord {
  reportId: string;
  ownerId: string;
  createdAt: Date;
  candidates: CandidateSubmission[];
  report: CohortAnalysisReport;
}

const reportSchema = new mongoose.Schema<ReportRecord>({
  reportId: { type: String, required: true, unique: true, index: true },
  ownerId: { type: String, required: true, index: true },
  candidates: { type: [new mongoose.Schema({
    id: { type: String, required: true },
    candidateName: { type: String, required: true },
    filename: { type: String, required: true },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
  }, { _id: false })], required: true },
  report: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

reportSchema.index({ ownerId: 1, createdAt: -1 });

export const ReportModel: mongoose.Model<ReportRecord> =
  (mongoose.models.Report as mongoose.Model<ReportRecord> | undefined)
  ?? mongoose.model<ReportRecord>('Report', reportSchema);
