import { FastifyPluginAsync } from 'fastify';
import {
  analyzeCandidateCohort,
  compareSubmissions,
  CandidateSubmission,
  BatchAnalysisOptions,
} from '@zixie/engine';
import { reportStore } from '../storage/report-store.js';
import { DEMO_COHORT } from '../demo/sample-data.js';
import AdmZip from 'adm-zip';

export const analysisRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Health check
  fastify.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // 2. Demo Cohort Analysis
  fastify.get('/demo', async () => {
    const report = analyzeCandidateCohort(DEMO_COHORT);
    const reportId = reportStore.save(DEMO_COHORT, report);
    return {
      reportId,
      candidates: DEMO_COHORT,
      report,
    };
  });

  // 3. Batch Analysis (Supports JSON or Multipart Upload / Zip)
  fastify.post('/analyze', async (request, reply) => {
    let candidates: CandidateSubmission[] = [];
    let options: BatchAnalysisOptions = {};

    const contentType = request.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          const filename = part.filename;

          if (filename.endsWith('.zip')) {
            // Unpack ZIP archive
            const zip = new AdmZip(buffer);
            const zipEntries = zip.getEntries();

            for (const entry of zipEntries) {
              if (!entry.isDirectory && !entry.entryName.startsWith('__MACOSX')) {
                const ext = entry.name.split('.').pop()?.toLowerCase() || '';
                const validExts = ['js', 'ts', 'jsx', 'tsx', 'cpp', 'cc', 'c', 'java', 'py'];
                if (validExts.includes(ext)) {
                  const content = entry.getData().toString('utf8');
                  const candName = entry.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

                  candidates.push({
                    id: `cand_${Math.random().toString(36).slice(2, 9)}`,
                    candidateName: candName,
                    filename: entry.name,
                    language: ext === 'py' ? 'python' : ext === 'java' ? 'java' : ext === 'cpp' || ext === 'c' ? 'cpp' : 'javascript',
                    sourceCode: content,
                  });
                }
              }
            }
          } else {
            // Single source code file upload
            const content = buffer.toString('utf8');
            const ext = filename.split('.').pop()?.toLowerCase() || 'js';
            const candName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

            candidates.push({
              id: `cand_${Math.random().toString(36).slice(2, 9)}`,
              candidateName: candName,
              filename,
              language: ext === 'py' ? 'python' : ext === 'java' ? 'java' : ext === 'cpp' ? 'cpp' : 'javascript',
              sourceCode: content,
            });
          }
        } else if (part.type === 'field' && part.fieldname === 'options') {
          try {
            options = JSON.parse(part.value as string);
          } catch {
            // ignore malformed options
          }
        }
      }
    } else {
      // Standard JSON payload
      const body = request.body as {
        candidates?: CandidateSubmission[];
        options?: BatchAnalysisOptions;
      };

      if (!body || !Array.isArray(body.candidates) || body.candidates.length < 2) {
        return reply.status(400).send({
          error: 'At least 2 candidate submissions are required for plagiarism/collusion analysis.',
        });
      }

      candidates = body.candidates;
      options = body.options || {};
    }

    if (candidates.length < 2) {
      return reply.status(400).send({
        error: 'At least 2 valid source code files are required to perform comparative analysis.',
      });
    }

    const report = analyzeCandidateCohort(candidates, options);
    const reportId = reportStore.save(candidates, report);

    return {
      reportId,
      candidates,
      report,
    };
  });

  // 4. Get Report by ID
  fastify.get('/reports/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const session = reportStore.get(id);

    if (!session) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    return session;
  });

  // 5. Compare Two Candidates in a Report (For Side-by-Side Diff)
  fastify.get('/reports/:id/compare', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { candA: candAId, candB: candBId } = request.query as {
      candA?: string;
      candB?: string;
    };

    const session = reportStore.get(id);
    if (!session) {
      return reply.status(404).send({ error: 'Report session not found' });
    }

    const candA = session.candidates.find((c) => c.id === candAId);
    const candB = session.candidates.find((c) => c.id === candBId);

    if (!candA || !candB) {
      return reply.status(404).send({ error: 'One or both candidates not found in this session.' });
    }

    const comparison = compareSubmissions(candA, candB);

    return {
      candA: {
        id: candA.id,
        candidateName: candA.candidateName,
        filename: candA.filename,
        sourceCode: candA.sourceCode,
      },
      candB: {
        id: candB.id,
        candidateName: candB.candidateName,
        filename: candB.filename,
        sourceCode: candB.sourceCode,
      },
      comparison,
    };
  });
};
