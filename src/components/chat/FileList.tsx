/**
 * File list component
 */

'use client';

import { useState } from 'react';
import { formatFileSize } from '@/utils/format';
import type { ChatMessage } from '@/types/chat';
import { ImagePreviewModal } from './ImagePreviewModal';

// Get file icon based on file extension
function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
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
  
  // Default file icon
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

interface FileListProps {
  files: ChatMessage['files'];
  threadId: string | null;
  projectId: string | null;
}

export function FileList({ files, threadId, projectId }: FileListProps) {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
    fileId: string;
  } | null>(null);

  console.log('FileList rendering with files:', files);

  if (!files || files.length === 0) {
    console.log('FileList: No files to display');
    return null;
  }

  // Check if file is an image
  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
  };

  const handleFileClick = async (file: { file_id: string; file_name: string }) => {
    if (!threadId || !projectId) {
      console.error('Thread ID or Project ID not available');
      return;
    }

    // If it's an image, show preview instead of downloading
    if (isImageFile(file.file_name)) {
      try {
        // Fetch the image to create object URL for preview
        const params = new URLSearchParams({
          thread_id: threadId,
          project_id: projectId,
        });
        const response = await fetch(`/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to load image' }));
          throw new Error(errorData.error || 'Failed to load image');
        }

        const blob = await response.blob();
        const imageUrl = window.URL.createObjectURL(blob);
        
        setPreviewImage({
          url: imageUrl,
          fileName: file.file_name,
          fileId: file.file_id,
        });
      } catch (error) {
        console.error('Error loading image:', error);
        alert(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return;
    }

    // For non-image files, download directly
    if (!threadId || !projectId) {
      console.error('Thread ID or Project ID not available');
      return;
    }

    // Check if already downloading
    if (downloading.has(file.file_id)) {
      return;
    }

    setDownloading((prev) => new Set(prev).add(file.file_id));

    try {
      // Use API route to download file (server-side handles API key)
      const params = new URLSearchParams({
        thread_id: threadId,
        project_id: projectId,
      });
      const response = await fetch(`/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`);

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
      console.error('Error downloading file:', error);
      alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(file.file_id);
        return next;
      });
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!threadId || !projectId) {
      console.error('Thread ID or Project ID not available');
      return;
    }

    // Check if already downloading
    if (downloading.has(fileId)) {
      return;
    }

    setDownloading((prev) => new Set(prev).add(fileId));

    try {
      // Use API route to download file
      const params = new URLSearchParams({
        thread_id: threadId,
        project_id: projectId,
      });
      const response = await fetch(`/api/files/${encodeURIComponent(fileId)}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download file' }));
        throw new Error(errorData.error || 'Failed to download file');
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const handleClosePreview = () => {
    if (previewImage) {
      // Clean up object URL
      window.URL.revokeObjectURL(previewImage.url);
      setPreviewImage(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Related Files:
      </div>
      {files.map((file) => {
        const isDownloading = downloading.has(file.file_id);
        return (
          <button
            key={file.file_id}
            onClick={() => handleFileClick(file)}
            disabled={isDownloading || !threadId || !projectId}
            className="w-full flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-3 text-sm text-gray-200 hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isDownloading ? (
                <svg
                  className="w-5 h-5 animate-spin text-blue-400 flex-shrink-0"
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
                <span className="flex-shrink-0">{getFileIcon(file.file_name)}</span>
              )}
              <span className="font-mono font-medium text-gray-100 group-hover:text-white transition-colors duration-150 ease-in-out truncate">{file.file_name}</span>
            </div>
            <span className="text-xs font-normal text-gray-400 flex-shrink-0 ml-2">{formatFileSize(file.file_size)}</span>
          </button>
        );
      })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          onClose={handleClosePreview}
          imageUrl={previewImage.url}
          fileName={previewImage.fileName}
          onDownload={() => handleDownload(previewImage.fileId, previewImage.fileName)}
        />
      )}
    </>
  );
}
