import React, { useState, useMemo, useRef } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import {
  UploadCloud,
  Search,
  FileCode2,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { CandidateSubmission } from '../types/zixie';
import {
  FadeUp,
  SlideInRight,
  MotionButton,
} from '../components/motion/primitives';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { CodeViewer } from '../components/code/CodeViewer';
import { ErrorStateView } from '../components/ui/StateViews';

const ALLOWED_EXTENSIONS = ['.zip', '.py', '.java', '.cpp', '.c', '.ts', '.js', '.go'];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const SubmissionsPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport, setReport } = useApp();

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileErrors, setFileErrors] = useState<{ filename: string; reason: string }[]>([]);
  const [uploadServerError, setUploadServerError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ATTENTION' | 'CLEAN'>('ALL');
  const [sortBy, setSortBy] = useState<'similarity' | 'name' | 'ai'>('similarity');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setFileErrors([]);
    setUploadServerError(null);

    const validFiles: File[] = [];
    const invalid: { filename: string; reason: string }[] = [];

    Array.from(fileList).forEach((file) => {
      const lower = file.name.toLowerCase();
      const matches = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      if (!matches) {
        invalid.push({
          filename: file.name,
          reason: `Unsupported extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        });
      } else {
        validFiles.push(file);
      }
    });

    if (invalid.length > 0) {
      setFileErrors(invalid);
      return;
    }

    const uploadBytes = validFiles.reduce((total, file) => total + file.size, 0);
    if (uploadBytes > MAX_UPLOAD_BYTES) {
      setUploadServerError('Selected files exceed the 4 MiB upload limit. Split them into smaller batches.');
      return;
    }

    setUploadProgress(1);
    try {
      const res = await api.uploadSubmissions(validFiles, (pct) => setUploadProgress(pct));
      setReport(res.report);
      if (res.report.candidates.length > 0) {
        setSelectedCandidateId(res.report.candidates[0].id);
      }
    } catch (err) {
      setUploadServerError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadProgress(null);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!report) return [];
    return report.candidates
      .filter((c) => {
        if (
          search &&
          !c.candidateName.toLowerCase().includes(search.toLowerCase()) &&
          !c.filename.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        if (filterTab === 'ATTENTION') return c.verdict !== 'CLEAR';
        if (filterTab === 'CLEAN') return c.verdict === 'CLEAR';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'similarity') return b.maxSimilarityScore - a.maxSimilarityScore;
        if (sortBy === 'ai') return b.aiProbability - a.aiProbability;
        return a.candidateName.localeCompare(b.candidateName);
      });
  }, [report, search, filterTab, sortBy]);

  const selectedCandidate: CandidateSubmission | null = useMemo(() => {
    if (!report || !selectedCandidateId) return null;
    return report.candidates.find((c) => c.id === selectedCandidateId) || null;
  }, [report, selectedCandidateId]);

  if (loadingReport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="skeleton-shimmer" style={{ height: 120 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 'var(--space-4)' }}>
          <div className="skeleton-shimmer" style={{ height: 480 }} />
          <div className="skeleton-shimmer" style={{ height: 480 }} />
        </div>
      </div>
    );
  }

  if (reportError) {
    return <ErrorStateView message={reportError} onRetry={refreshReport} />;
  }

  return (
    <FadeUp style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Drag-and-Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          validateAndUpload(e.dataTransfer.files);
        }}
        className="zixie-card"
        style={{
          padding: 'var(--space-6)',
          borderStyle: 'dashed',
          borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
          backgroundColor: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <UploadCloud size={24} color={dragOver ? 'var(--accent)' : 'var(--text-secondary)'} />
        {dragOver ? (
          <FadeUp>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Drop to upload</span>
          </FadeUp>
        ) : (
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            Upload a submission batch to begin analysis.
          </p>
        )}
        <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          Supported: .zip, .py, .java, .cpp, .c, .ts, .js, .go
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => validateAndUpload(e.target.files)}
        />

        <MotionButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="zixie-button"
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          Select archive or source files
        </MotionButton>

        {uploadProgress !== null && (
          <div style={{ width: '100%', maxWidth: 360, marginTop: 'var(--space-3)' }}>
            <div
              style={{
                height: 4,
                width: '100%',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: 'var(--accent)',
                  transition: 'width 0.15s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Inline per-file errors */}
        {fileErrors.length > 0 && (
          <div
            style={{
              width: '100%',
              marginTop: 'var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
              textAlign: 'left',
            }}
          >
            {fileErrors.map((err) => (
              <div
                key={err.filename}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--risk-collusion)',
                }}
              >
                <AlertCircle size={12} />
                <span className="mono">{err.filename}:</span>
                <span>{err.reason}</span>
              </div>
            ))}
          </div>
        )}

        {uploadServerError && (
          <div style={{ color: 'var(--risk-collusion)', fontSize: 'var(--text-xs)' }}>
            {uploadServerError}
          </div>
        )}
      </div>

      {/* Split View: Candidate List + Candidate Dossier */}
      {report && report.candidates.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
            alignItems: 'start',
          }}
        >
          {/* Left Panel: Search, Filters, Sort, Virtualized List */}
          <div className="zixie-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: 10, top: 10 }}
                />
                <input
                  type="search"
                  placeholder="Filter candidates or filenames..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="zixie-input"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3) var(--space-2) var(--space-8)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  {(['ALL', 'ATTENTION', 'CLEAN'] as const).map((tab) => (
                    <MotionButton
                      key={tab}
                      type="button"
                      onClick={() => setFilterTab(tab)}
                      className="zixie-button"
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        backgroundColor:
                          filterTab === tab ? 'var(--accent)' : 'var(--bg-elevated)',
                        color: filterTab === tab ? '#FAFAFA' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {tab === 'ALL' ? 'All' : tab === 'ATTENTION' ? 'Attention' : 'Clean'}
                    </MotionButton>
                  ))}
                </div>

                <select
                  aria-label="Sort candidates"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="zixie-input"
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <option value="similarity">Sort: Max Similarity</option>
                  <option value="ai">Sort: AI Signal</option>
                  <option value="name">Sort: Candidate Name</option>
                </select>
              </div>

              {/* Candidate Rows — Virtualized with react-window when exceeding 50 items */}
              {filteredCandidates.length > 50 ? (
                <VirtualList
                  height={480}
                  itemCount={filteredCandidates.length}
                  itemSize={56}
                  width="100%"
                >
                  {({ index, style }) => {
                    const c = filteredCandidates[index];
                    const active = c.id === selectedCandidateId;
                    return (
                      <div style={style}>
                        <MotionButton
                          type="button"
                          onClick={() => setSelectedCandidateId(c.id)}
                          style={{
                            width: '100%',
                            height: 52,
                            padding: '0 var(--space-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: active
                              ? 'rgba(99, 102, 241, 0.14)'
                              : 'var(--bg-base)',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {c.candidateName}
                            </div>
                            <div
                              className="mono"
                              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                            >
                              {c.filename}
                            </div>
                          </div>
                          <VerdictBadge verdict={c.verdict} />
                        </MotionButton>
                      </div>
                    );
                  }}
                </VirtualList>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    maxHeight: 480,
                    overflowY: 'auto',
                  }}
                >
                  {filteredCandidates.map((c) => {
                    const active = c.id === selectedCandidateId;
                    return (
                      <MotionButton
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCandidateId(c.id)}
                        style={{
                          width: '100%',
                          padding: 'var(--space-2) var(--space-3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: active
                            ? 'rgba(99, 102, 241, 0.14)'
                            : 'var(--bg-base)',
                          border: active
                            ? '1px solid var(--accent)'
                            : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-control)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {c.candidateName}
                          </div>
                          <div
                            className="mono"
                            style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                          >
                            {c.filename}
                          </div>
                        </div>
                        <VerdictBadge verdict={c.verdict} />
                      </MotionButton>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Candidate Dossier */}
          {selectedCandidate ? (
            <SlideInRight
              key={selectedCandidate.id}
              className="zixie-card"
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)' }}>
                    {selectedCandidate.candidateName}
                  </h2>
                  <div
                    className="mono"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    <span>{selectedCandidate.filename}</span>
                    <span>·</span>
                    <span
                      style={{
                        padding: '0 6px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                      }}
                    >
                      {selectedCandidate.language}
                    </span>
                    <span>·</span>
                    <span>{new Date(selectedCandidate.submittedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {selectedCandidate.clusterId && (
                    <span
                      className="mono"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Users size={12} />
                      Cluster #{selectedCandidate.clusterId}
                    </span>
                  )}
                  <VerdictBadge verdict={selectedCandidate.verdict} />
                </div>
              </div>

              {/* Most Similar Partner & Breakdown Bars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Most Similar Partner
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 'var(--space-1)' }}>
                    {selectedCandidate.mostSimilarPartnerName || 'None flagged'}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                  >
                    Combined: {(selectedCandidate.maxSimilarityScore * 100).toFixed(1)}% ·
                    Winnowing: {(selectedCandidate.winnowingScore * 100).toFixed(1)}% · Tiling:{' '}
                    {(selectedCandidate.tilingScore * 100).toFixed(1)}%
                  </div>
                </div>

                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>Heuristic AI Signal</span>
                    <Sparkles size={12} color="var(--risk-ai)" />
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 600,
                      color: 'var(--risk-ai)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {Math.round(selectedCandidate.aiProbability * 100)}% likelihood
                  </div>
                </div>
              </div>

              {/* Source Code Viewer */}
              <CodeViewer
                code={selectedCandidate.sourceCode}
                language={selectedCandidate.language}
              />
            </SlideInRight>
          ) : (
            <div
              className="zixie-card"
              style={{
                minHeight: 420,
                borderStyle: 'dashed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                color: 'var(--text-secondary)',
                padding: 'var(--space-8)',
              }}
            >
              <FileCode2 size={24} />
              <span style={{ fontSize: 'var(--text-sm)' }}>
                Select a candidate from the left panel to inspect source dossier and similarity signals.
              </span>
            </div>
          )}
        </div>
      )}
    </FadeUp>
  );
};
