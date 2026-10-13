import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileCode, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/cn';

interface UploadZoneProps {
  isLoading: boolean;
  onUpload: (files: File[]) => void;
}

export function UploadZone({ isLoading, onUpload }: UploadZoneProps) {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setStagedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/plain': ['.txt'],
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/x-python': ['.py'],
      'text/x-c++src': ['.cpp', '.cc', '.h', '.hpp'],
      'text/x-java-source': ['.java'],
    },
    disabled: isLoading,
  });

  const removeFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setStagedFiles([]);
  };

  const handleStartAnalysis = () => {
    if (stagedFiles.length === 0) return;
    onUpload(stagedFiles);
  };

  return (
    <div className="bg-z-surface-1 border border-z-border rounded-md p-5 sm:p-6 shadow-z-sm space-y-5">
      <div className="flex items-center justify-between border-b border-z-border pb-3">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-z-text-primary">
            Dossier Ingestion & Batch Ingest
          </h3>
          <p className="text-[11px] font-mono text-z-text-muted">
            Drag candidate code submissions (.zip archive or individual source files).
          </p>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-z-surface-2 text-z-text-secondary border border-z-border hidden sm:inline-block">
          C++, Java, Python, TypeScript/JS
        </span>
      </div>

      {/* Drop Zone Box */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-md p-8 sm:p-10 text-center transition-all cursor-pointer relative overflow-hidden group',
          isDragActive
            ? 'border-z-accent bg-z-accent-subtle/30 scale-[0.99]'
            : 'border-z-border hover:border-z-border-strong bg-z-surface-2/40 hover:bg-z-surface-2/60'
        )}
      >
        <input {...getInputProps()} />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-md bg-z-surface-1 border border-z-border flex items-center justify-center mx-auto text-z-text-secondary group-hover:text-z-accent group-hover:border-z-accent transition-colors shadow-z-sm">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-z-accent" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-z-text-primary">
              {isDragActive
                ? 'Drop candidate files here...'
                : 'Drop submissions here or browse local disk'}
            </p>
            <p className="text-xs font-mono text-z-text-muted mt-1">
              Supports .zip archives with multiple submissions or raw source files
            </p>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-z-surface-3 border border-z-border text-xs font-mono text-z-text-secondary group-hover:text-z-text-primary transition-colors">
              <span>Select Files</span>
              <ArrowRight className="w-3 h-3 text-z-accent" />
            </span>
          </div>
        </div>
      </div>

      {/* Staged Files Preview */}
      {stagedFiles.length > 0 && (
        <div className="space-y-3 border-t border-z-border pt-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-z-text-primary">
              Queued Files ({stagedFiles.length})
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-[11px] text-z-text-muted hover:text-z-flagged transition-colors cursor-pointer"
            >
              Clear Queue
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {stagedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2 rounded bg-z-surface-2 border border-z-border text-xs font-mono"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-3.5 h-3.5 text-z-accent shrink-0" />
                  <span className="text-z-text-primary truncate">{file.name}</span>
                  <span className="text-[10px] text-z-text-muted shrink-0">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded text-z-text-muted hover:text-z-text-primary hover:bg-z-surface-3 transition-colors cursor-pointer"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleStartAnalysis}
              disabled={isLoading}
              className="font-mono text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing ASTs & Winnowing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Execute Forensic Analysis ({stagedFiles.length} files)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
