import React, { useState, useEffect } from 'react';
import { FileText, Loader2, X, Plus, Search } from 'lucide-react';
import { googleDriveApi, type DriveFile } from '../api/googleDrive';

interface DriveFilePickerProps {
  onClose: () => void;
  onFileSelected: (text: string, title: string, detectedKey: string) => void;
}

export const DriveFilePicker: React.FC<DriveFilePickerProps> = ({ onClose, onFileSelected }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async (email: string, query?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleDriveApi.listFiles(email, query);
      setFiles(data);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any).response?.status === 403) {
         setError('Access denied. Google Drive connection expired or invalid.');
      } else {
         setError('Failed to fetch Google Drive files.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const accs = await googleDriveApi.getAccounts();
        const emails = accs.map(a => a.email);
        setAccounts(emails);
        
        if (emails.length > 0) {
          setSelectedAccount(emails[0]);
          await loadFiles(emails[0]);
        } else {
          setLoading(false);
        }
      } catch {
        setError('Failed to load Google Drive integrations.');
        setLoading(false);
      }
    };
    init();

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        init(); // Reload accounts
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEmail = e.target.value;
    setSelectedAccount(newEmail);
    setSearchQuery('');
    loadFiles(newEmail);
  };

  const handleSearch = () => {
    if (selectedAccount) {
      loadFiles(selectedAccount, searchQuery);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleConnect = async () => {
    try {
      const url = await googleDriveApi.getAuthUrl();
      const popup = window.open(url, 'GoogleAuth', 'width=500,height=600,left=200,top=100');
      
      // Fallback in case popup is blocked
      if (!popup) {
        localStorage.setItem('googleAuthReturnUrl', window.location.pathname);
        window.location.href = url;
      }
    } catch {
      setError('Failed to start Google authentication.');
    }
  };

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleImport = async (fileId: string) => {
    if (!selectedAccount || !fileId) return;
    try {
      setImporting(fileId);
      const text = await googleDriveApi.extractText(fileId, selectedAccount);
      
      const file = files.find(f => f.id === fileId);
      const rawName = file?.name || '';
      const title = rawName.replace(/\.(docx?|pdf|txt)$/i, '');

      let detectedKey = 'C';
      const bracketMatch = text.match(/\[([A-G][#b]?(?:m)?(?:[^\w\]]*)?)\]/);
      if (bracketMatch) {
        detectedKey = bracketMatch[1].trim();
      } else {
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (/^[A-G][#b]?\w*(\s+[A-G][#b]?\w*)*$/.test(trimmed)) {
            const firstChord = trimmed.split(/\s+/)[0];
            if (firstChord && /^[A-G]/.test(firstChord)) {
              detectedKey = firstChord;
              break;
            }
          }
        }
      }

      onFileSelected(text, title, detectedKey);
    } catch {
      setError('Failed to extract text from selected document.');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#f6f6f3] w-full max-w-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-ink">Select Document from Google Drive</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-ink" />
          </button>
        </div>

        {accounts.length > 0 && !loading && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-body font-medium">Account:</span>
              <select 
                value={selectedAccount || ''} 
                onChange={handleAccountChange}
                className="p-2 border border-gray-300 rounded-md bg-white text-ink focus:outline-none focus:ring-2 focus:ring-pinterestRed"
              >
                {accounts.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleConnect}
              className="text-sm flex items-center text-pinterestRed hover:underline font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another account
            </button>
          </div>
        )}

        {accounts.length > 0 && !loading && files.length >= 0 && (
          <div className="px-6 pt-6 pb-2">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[16px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pinterestRed sm:text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-gray-100 hover:bg-gray-200 text-ink font-semibold py-2 px-4 rounded-[16px] transition-colors border border-gray-300"
              >
                Search
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {error && (
            <div className="bg-red-100 text-pinterestRed p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-pinterestRed animate-spin mb-4" />
              <p className="text-body">Loading documents...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-body mb-6">Your account is not connected to Google Drive.</p>
              <button
                onClick={handleConnect}
                className="bg-pinterestRed hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                Connect to Google Drive
              </button>
            </div>
          ) : files.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-body">No Word documents (.doc/.docx) found in your Drive.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => {
                const isSelected = selectedFileId === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    onDoubleClick={() => handleImport(file.id)}
                    disabled={!!importing}
                    className={`w-full flex items-center p-4 rounded-md transition-colors border text-left disabled:opacity-50 ${
                      isSelected 
                        ? 'bg-red-50 border-pinterestRed' 
                        : 'hover:bg-white border-transparent hover:border-gray-200'
                    }`}
                  >
                    <FileText className={`w-6 h-6 mr-4 flex-shrink-0 ${isSelected ? 'text-pinterestRed' : 'text-blue-500'}`} />
                    <div className="flex-1 flex flex-col items-start truncate overflow-hidden">
                      {file.parentFolderName && (
                        <span className="text-xs text-gray-500 opacity-70 truncate max-w-full">
                          {file.parentFolderName}
                        </span>
                      )}
                      <span className="text-ink font-medium truncate max-w-full">{file.name}</span>
                    </div>
                    {importing === file.id && <Loader2 className="w-5 h-5 text-pinterestRed animate-spin" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {files.length > 0 && accounts.length > 0 && !loading && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-ink font-semibold rounded-full hover:bg-gray-200 transition-colors"
              disabled={!!importing}
            >
              Cancel
            </button>
            <button
              onClick={() => selectedFileId && handleImport(selectedFileId)}
              disabled={!selectedFileId || !!importing}
              className="px-6 py-2 bg-pinterestRed hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors flex items-center"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
