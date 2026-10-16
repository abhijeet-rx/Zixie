import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileCode, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface StitchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  isLoading: boolean;
}

export function StitchUploadModal({
  isOpen,
  onClose,
  onUpload,
  isLoading,
}: StitchUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    setUploadError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/plain': ['.py', '.java', '.cpp', '.c', '.ts', '.js', '.go', '.rs'],
      'application/x-zip-compressed': ['.zip'],
    },
    disabled: isLoading,
  });

  const handleStartAnalysis = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploadError(null);
      await onUpload(selectedFiles);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ingest Cohort Submissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload assignment zip archive or multi-file student directory
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {uploadError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {isDragActive ? 'Drop files here...' : 'Click to browse or drag & drop files'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Supports .zip cohorts, Python (.py), Java (.java), C++ (.cpp), and TypeScript (.ts)
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Selected Files ({selectedFiles.length})</span>
                <span className="text-slate-500 font-normal">
                  {Math.round(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024)} KB total
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 truncate">
                    <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={selectedFiles.length === 0 || isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Cohort...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Run Integrity Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
