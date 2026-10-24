import React, { useState, useMemo, useRef } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import {
  UploadCloud,
  Search,
  FileCode2,
  AlertCircle,
  Users,
  Sparkles,
  X,
  Trash2,
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
const MAX_PASTE_CHARACTERS = 10_000;

const CODE_EXAMPLES = [
  {
    label: 'Very similar code',
    filename: 'binary_search_copy.js',
    source: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  {
    label: 'Reworked code',
    filename: 'binary_search_reworked.js',
    source: `const locateValue = (values, wanted) => {
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (values[middle] === wanted) return middle;
    if (values[middle] < wanted) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
};`,
  },
  {
    label: 'Different code',
    filename: 'merge_sort.js',
    source: `function mergeSort(values) {
  if (values.length < 2) return values;

  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  while (left.length && right.length) {
    result.push(left[0] <= right[0] ? left.shift() : right.shift());
  }
  return result.concat(left, right);
}`,
  },
];

export const SubmissionsPage: React.FC = () => {
  const { report, loadingReport, reportError, refreshReport, setReport } = useApp();

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileErrors, setFileErrors] = useState<{ filename: string; reason: string }[]>([]);
  const [uploadServerError, setUploadServerError] = useState<string | null>(null);
  const [submissionActionMessage, setSubmissionActionMessage] = useState<string | null>(null);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [pasteCode, setPasteCode] = useState('');
  const [pasteFilename, setPasteFilename] = useState('submission.js');
  const [entryMode, setEntryMode] = useState<'paste' | 'files'>('paste');

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ATTENTION' | 'CLEAN'>('ALL');
  const [sortBy, setSortBy] = useState<'similarity' | 'name' | 'ai'>('similarity');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stageFiles = (fileList: FileList | File[] | null): boolean => {
    if (!fileList || fileList.length === 0) return false;
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
      return false;
    }

    const nextFiles = [...queuedFiles, ...validFiles];
    const uploadBytes = nextFiles.reduce((total, file) => total + file.size, 0);
    if (uploadBytes > MAX_UPLOAD_BYTES) {
      setUploadServerError('These files are larger than the 4 MB limit. Remove a file or choose smaller files.');
      return false;
    }

    setQueuedFiles(nextFiles);
    return true;
  };

  const addPastedCode = () => {
    const source = pasteCode.trim();
    if (!source) {
      setUploadServerError('Paste code before adding this submission.');
      return;
    }

    const filename = pasteFilename.trim() || `submission-${queuedFiles.length + 1}.js`;
    const allowedName = ALLOWED_EXTENSIONS.some((extension) => filename.toLowerCase().endsWith(extension));
    if (!allowedName || filename.toLowerCase().endsWith('.zip')) {
      setUploadServerError('Use a file name ending in .py, .java, .cpp, .c, .ts, .js, or .go.');
      return;
    }

    const pastedFile = new File([source], filename, { type: 'text/plain' });
    if (!stageFiles([pastedFile])) return;
    setPasteCode('');
    setPasteFilename(`submission-${queuedFiles.length + 2}.js`);
  };

  const analyzeQueuedFiles = async () => {
    if (queuedFiles.length < 2) {
      setUploadServerError('Add at least two submissions before comparing.');
      return;
    }

    setUploadServerError(null);
    setUploadProgress(1);
    try {
      const res = await api.uploadSubmissions(queuedFiles, (pct) => setUploadProgress(pct));
      setReport(res.report);
      if (res.report.candidates.length > 0) {
        setSelectedCandidateId(res.report.candidates[0].id);
      }
      setQueuedFiles([]);
    } catch (err) {
      setUploadServerError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadProgress(null);
    }
  };

  const removeCandidate = async (candidate: CandidateSubmission) => {
    if (!report || uploadProgress !== null) return;
    if (report.candidates.length <= 2) {
      setUploadServerError('Keep at least two submissions in the set so Zixie can compare them.');
      return;
    }

    const remainingCandidates = report.candidates.filter((item) => item.id !== candidate.id);
    const confirmed = window.confirm(
      `Remove “${candidate.candidateName}” from this set and compare the remaining ${remainingCandidates.length} submissions again?`,
    );
    if (!confirmed) return;

    setUploadServerError(null);
    setSubmissionActionMessage(null);
    setUploadProgress(1);
    try {
      const files = remainingCandidates.map(
        (item) => new File([item.sourceCode], item.filename, { type: 'text/plain' }),
      );
      const res = await api.uploadSubmissions(files, (pct) => setUploadProgress(pct));
      setReport(res.report);
      setSelectedCandidateId((currentId) =>
        currentId && remainingCandidates.some((item) => item.id === currentId)
          ? res.report.candidates.find((item) => item.filename === remainingCandidates.find((candidateItem) => candidateItem.id === currentId)?.filename)?.id ?? res.report.candidates[0]?.id ?? null
          : res.report.candidates[0]?.id ?? null,
      );
      setSubmissionActionMessage(`Removed ${candidate.filename} and updated the comparison.`);
    } catch (err) {
      setUploadServerError(err instanceof Error ? err.message : 'Could not remove this submission.');
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
      {/* Submission composer */}
      <section className="submission-composer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>Add submissions</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
              Paste code or upload files. Add at least two submissions to compare them.
            </p>
          </div>
          <div role="tablist" aria-label="Submission input method" style={{ display: 'inline-flex', gap: 6, padding: 4, borderRadius: 'var(--radius-control)', backgroundColor: 'var(--bg-elevated)' }}>
            {(['paste', 'files'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={entryMode === mode}
                onClick={() => setEntryMode(mode)}
                className="submission-composer__tab"
                style={{
                  border: '1px solid',
                  borderColor: entryMode === mode ? 'var(--border)' : 'transparent',
                  borderRadius: 'var(--radius-control)',
                  padding: '6px 12px',
                  backgroundColor: entryMode === mode ? 'var(--bg-surface)' : 'transparent',
                  color: entryMode === mode ? 'var(--text-primary)' : 'var(--text-secondary)',
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {mode === 'paste' ? 'Paste code' : 'Upload files'}
              </button>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            stageFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {entryMode === 'paste' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Examples:</span>
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setPasteCode(example.source);
                    setPasteFilename(example.filename);
                    setUploadServerError(null);
                  }}
                  className="submission-composer__example"
                  style={{ border: '1px solid var(--border)', borderRadius: 999, padding: '5px 12px', background: 'transparent', color: 'var(--text-primary)', font: 'inherit', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>File name</span>
              <input
                value={pasteFilename}
                onChange={(e) => setPasteFilename(e.target.value)}
                maxLength={120}
                placeholder="submission.js"
                className="zixie-input"
                style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
              />
            </label>

            <textarea
              value={pasteCode}
              onChange={(e) => {
                setPasteCode(e.target.value);
                setUploadServerError(null);
              }}
              maxLength={MAX_PASTE_CHARACTERS}
              rows={8}
              placeholder="Paste a student's source code here..."
              aria-label="Paste source code"
              className="submission-code-editor"
              style={{
                width: '100%',
                minHeight: 190,
                resize: 'vertical',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.65,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                {pasteCode.length.toLocaleString()}/{MAX_PASTE_CHARACTERS.toLocaleString()} characters
              </span>
              <MotionButton
                type="button"
                onClick={addPastedCode}
                className="zixie-button submission-composer__secondary-action"
                style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Add submission
              </MotionButton>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); stageFiles(e.dataTransfer.files); }}
            style={{
              minHeight: 190,
              padding: 'var(--space-6)',
              border: `1px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-base)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'var(--space-2)',
            }}
          >
            <UploadCloud size={24} color={dragOver ? 'var(--accent)' : 'var(--text-secondary)'} />
            <strong style={{ fontSize: 'var(--text-sm)' }}>{dragOver ? 'Drop files to add them' : 'Upload source files or a ZIP archive'}</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Code files (.py, .java, .cpp, .c, .ts, .js, .go) or a ZIP folder · Up to 4 MB total</span>
            <MotionButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="zixie-button submission-composer__secondary-action"
              style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              Select archive or source files
            </MotionButton>
          </div>
        )}

        {fileErrors.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {fileErrors.map((err) => (
              <div key={err.filename} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--risk-collusion)' }}>
                <AlertCircle size={12} />
                <span>{err.filename}: {err.reason}</span>
              </div>
            ))}
          </div>
        )}

        {queuedFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Ready to compare · {queuedFiles.length} {queuedFiles.length === 1 ? 'submission' : 'submissions'}</strong>
              <span>{(queuedFiles.reduce((total, file) => total + file.size, 0) / 1024).toFixed(1)} KB / 4096 KB</span>
            </div>
            {queuedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--bg-base)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--text-xs)' }}>{file.name}</span>
                <button type="button" aria-label={`Remove ${file.name}`} title="Remove submission" onClick={() => setQueuedFiles((current) => current.filter((_, i) => i !== index))} style={{ display: 'inline-flex', border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadServerError && <div role="alert" style={{ color: 'var(--risk-collusion)', fontSize: 'var(--text-xs)' }}>{uploadServerError}</div>}

        {uploadProgress !== null && (
          <div aria-label={`Upload progress ${uploadProgress}%`} style={{ height: 4, backgroundColor: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--accent)', transition: 'width 0.15s ease' }} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Add at least two submissions to compare them.</span>
          <MotionButton
            type="button"
            onClick={() => void analyzeQueuedFiles()}
            disabled={uploadProgress !== null}
            className="zixie-button submission-composer__primary-action"
            style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: uploadProgress !== null ? 'wait' : 'pointer', opacity: uploadProgress !== null ? 0.7 : 1 }}
          >
            {uploadProgress !== null ? `Comparing… ${uploadProgress}%` : 'Compare submissions'}
          </MotionButton>
        </div>
      </section>

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
              {submissionActionMessage && (
                <div role="status" style={{ color: 'var(--risk-clear)', fontSize: 'var(--text-xs)' }}>
                  {submissionActionMessage}
                </div>
              )}
              {report.candidates.length <= 2 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  At least two submissions are needed for a comparison, so removal is unavailable for this set.
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: 10, top: 10 }}
                />
                <input
                  type="search"
                  placeholder="Search names or file names..."
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
                      {tab === 'ALL' ? 'All' : tab === 'ATTENTION' ? 'Needs review' : 'No close match'}
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
                  <option value="similarity">Sort: Highest match</option>
                  <option value="ai">Sort: AI writing estimate</option>
                  <option value="name">Sort: Name</option>
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
                      <div style={{ ...style, display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                        <MotionButton
                          type="button"
                          onClick={() => setSelectedCandidateId(c.id)}
                          style={{
                            flex: 1,
                            minWidth: 0,
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
                        <button
                          type="button"
                          aria-label={`Remove ${c.candidateName} from this set`}
                          title={report.candidates.length <= 2 ? 'At least two submissions must remain' : 'Remove submission and update comparison'}
                          disabled={report.candidates.length <= 2 || uploadProgress !== null}
                          onClick={() => void removeCandidate(c)}
                          style={{
                            flex: '0 0 36px',
                            height: 36,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-control)',
                            background: 'var(--bg-base)',
                            color: 'var(--text-muted)',
                            cursor: report.candidates.length <= 2 || uploadProgress !== null ? 'not-allowed' : 'pointer',
                            opacity: report.candidates.length <= 2 ? 0.45 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
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
                      <div key={c.id} style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                        <MotionButton
                          type="button"
                          onClick={() => setSelectedCandidateId(c.id)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: 'var(--space-2) var(--space-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 'var(--space-2)',
                            backgroundColor: active ? 'rgba(99, 102, 241, 0.14)' : 'var(--bg-base)',
                            border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-control)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.candidateName}
                            </div>
                            <div
                              className="mono"
                              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {c.filename}
                            </div>
                          </div>
                          <VerdictBadge verdict={c.verdict} />
                        </MotionButton>
                        <button
                          type="button"
                          aria-label={`Remove ${c.candidateName} from this set`}
                          title={report.candidates.length <= 2 ? 'At least two submissions must remain' : 'Remove submission and update comparison'}
                          disabled={report.candidates.length <= 2 || uploadProgress !== null}
                          onClick={() => void removeCandidate(c)}
                          style={{
                            flex: '0 0 36px',
                            height: 36,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-control)',
                            background: 'var(--bg-base)',
                            color: 'var(--text-muted)',
                            cursor: report.candidates.length <= 2 || uploadProgress !== null ? 'not-allowed' : 'pointer',
                            opacity: report.candidates.length <= 2 ? 0.45 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                    Closest Match
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 'var(--space-1)' }}>
                    {selectedCandidate.mostSimilarPartnerName || 'None flagged'}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
                  >
                    Overall match: {(selectedCandidate.maxSimilarityScore * 100).toFixed(1)}% ·
                    Text match: {(selectedCandidate.winnowingScore * 100).toFixed(1)}% · Code structure:{' '}
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
                    <span>AI Writing Estimate</span>
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
                    {Math.round(selectedCandidate.aiProbability * 100)}% pattern match
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
                Select a submission from the list to view its code and comparison results.
              </span>
            </div>
          )}
        </div>
      )}
    </FadeUp>
  );
};
