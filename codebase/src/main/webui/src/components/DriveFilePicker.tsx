import React, { useState, useEffect } from 'react';
import { FileText, Loader2, X } from 'lucide-react';
import { googleDriveApi, type DriveFile } from '../api/googleDrive';

interface DriveFilePickerProps {
  onClose: () => void;
  onFileSelected: (text: string) => void;
}

export const DriveFilePicker: React.FC<DriveFilePickerProps> = ({ onClose, onFileSelected }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await googleDriveApi.listFiles();
        setFiles(data);
      } catch {
        setError('Failed to fetch files from Google Drive. Please reconnect your account.');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleSelectFile = async (fileId: string) => {
    try {
      setImporting(fileId);
      const text = await googleDriveApi.extractText(fileId);
      onFileSelected(text);
    } catch {
      setError('Failed to extract text from the selected document.');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-ink">Select Document from Google Drive</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 text-pinterest-red p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-pinterest-red animate-spin mb-4" />
              <p className="text-body">Loading your documents...</p>
            </div>
          ) : files.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-body">No Word documents (.doc/.docx) found in your Drive.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file.id)}
                  disabled={!!importing}
                  className="w-full flex items-center p-4 hover:bg-white rounded-md transition-colors border border-transparent hover:border-gray-200 text-left disabled:opacity-50"
                >
                  <FileText className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                  <span className="flex-1 text-ink font-medium truncate">{file.name}</span>
                  {importing === file.id && <Loader2 className="w-5 h-5 text-pinterest-red animate-spin" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
