/**
 * File modal component to display all files in a thread
 */

'use client';

import { useState, useEffect } from 'react';
import { formatFileSize } from '@/utils/format';
import type { ThreadFile } from '@/types/helium';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string | null;
  projectId: string | null;
}

// Get file icon based on file type (MIME type) and file extension
function getFileIcon(fileName: string, fileType?: string) {
  // First, try to identify by MIME type (more reliable)
  if (fileType) {
    const mimeType = fileType.toLowerCase();
    
    // PDF files
    if (mimeType === 'application/pdf') {
      return (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    
    // Image files
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9,2V8H15V2H9M11,4H13V6H11V4M2,12V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V12H2M20,20H4V14H20V20Z" />
        </svg>
      );
    }
    
    // HTML files
    if (mimeType === 'text/html' || mimeType === 'application/xhtml+xml') {
      return (
        <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,18L16,14H13V10H11V14H8M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
        </svg>
      );
    }
    
    // Markdown files
    if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
        </svg>
      );
    }
    
    // Text files
    if (mimeType.startsWith('text/')) {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
        </svg>
      );
    }
    
    // JavaScript files
    if (mimeType === 'application/javascript' || mimeType === 'text/javascript') {
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
        </svg>
      );
    }
    
    // JSON files
    if (mimeType === 'application/json') {
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
        </svg>
      );
    }
    
    // CSS files
    if (mimeType === 'text/css') {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
        </svg>
      );
    }
  }
  
  // Fallback to file extension if MIME type is not available
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9,2V8H15V2H9M11,4H13V6H11V4M2,12V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V12H2M20,20H4V14H20V20Z" />
      </svg>
    );
  }
  
  if (['md', 'markdown'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  if (['html', 'htm'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,18L16,14H13V10H11V14H8M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
      </svg>
    );
  }
  
  if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  if (['json'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  if (['css', 'scss', 'sass', 'less'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  if (['py', 'pyw'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  if (['ts', 'tsx'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  // Default file icon
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export function FileModal({ isOpen, onClose, threadId, projectId }: FileModalProps) {
  const [files, setFiles] = useState<ThreadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && threadId && projectId) {
      fetchFiles();
    } else {
      setFiles([]);
      setError(null);
    }
  }, [isOpen, threadId, projectId]);

  const fetchFiles = async () => {
    if (!threadId || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem('helium_api_key');
      const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
      
      const response = await fetch(
        `/api/chat/${threadId}/files?project_id=${projectId}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch files' }));
        throw new Error(errorData.error || 'Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: ThreadFile) => {
    if (!threadId || !projectId) {
      return;
    }

    // Check if already downloading
    if (downloading.has(file.file_id)) {
      return;
    }

    setDownloading((prev) => new Set(prev).add(file.file_id));

    try {
      // Use API route to download file
      const params = new URLSearchParams({
        thread_id: threadId,
        project_id: projectId,
      });
      const apiKey = localStorage.getItem('helium_api_key');
      const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
      const response = await fetch(`/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download file' }));
        throw new Error(errorData.error || 'Failed to download file');
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(file.file_id);
        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Thread Files</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchFiles}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 ease-in-out"
              >
                Retry
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <p className="text-gray-600">No files generated in this conversation yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const isDownloading = downloading.has(file.file_id);
                return (
                  <button
                    key={file.file_id}
                    onClick={() => handleFileClick(file)}
                    disabled={isDownloading || !threadId || !projectId}
                    className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isDownloading ? (
                        <svg
                          className="w-5 h-5 animate-spin text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : (
                        <div className="flex-shrink-0">
                          {getFileIcon(file.file_name, file.file_type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatFileSize(file.file_size)}
                          {file.file_type && ` • ${file.file_type}`}
                        </p>
                      </div>
                    </div>
                    {!isDownloading && (
                      <svg
                        className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-150 ease-in-out flex-shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
