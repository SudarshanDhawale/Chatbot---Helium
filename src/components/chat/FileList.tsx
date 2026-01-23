/**
 * File list component
 */

'use client';

import { useState, useEffect } from 'react';
import { formatFileSize } from '@/utils/format';
import type { ChatMessage } from '@/types/chat';
import { ImagePreviewModal } from './ImagePreviewModal';

// Get file icon based on file extension
function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  // PDF files
  if (['pdf'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
      </svg>
    );
  }
  
  // Word documents
  if (['doc', 'docx'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M15,18V16H13V18H15M15,14V12H13V14H15M11,18V16H9V18H11M11,14V12H9V14H11Z" />
      </svg>
    );
  }
  
  // Excel spreadsheets
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L15,15H13V11H11V15H9L12,19Z" />
      </svg>
    );
  }
  
  // PowerPoint presentations
  if (['ppt', 'pptx'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,11H13A2,2 0 0,1 15,13V15A2,2 0 0,1 13,17H10V11M11,12V16H13A1,1 0 0,0 14,15V13A1,1 0 0,0 13,12H11Z" />
      </svg>
    );
  }
  
  // Text files
  if (['txt', 'text'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V17H10V19M14,19H10V17H14V19M18,19H14V17H18V19M10,15H8V13H10V15M14,15H10V13H14V15M18,15H14V13H18V15Z" />
      </svg>
    );
  }
  
  // Markdown files
  if (['md', 'markdown'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L14,3M19,19H5V5H13V10H19V19Z" />
      </svg>
    );
  }
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9.5,16.5L11,15L9.5,13.5L8,15L9.5,16.5M12,15L13.5,13.5L15,15L16.5,13.5L15,12L16.5,10.5L15,9L13.5,10.5L12,9L10.5,10.5L12,12L10.5,13.5L12,15Z" />
      </svg>
    );
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return (
      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L15,16H13V12H11V16H9L12,19Z" />
      </svg>
    );
  }
  
  // Default file icon
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

interface FileListProps {
  files: ChatMessage['files'];
  threadId: string | null;
  projectId: string | null;
}

// Component to handle file preview/download with API key authentication
function ImagePreview({ 
  file, 
  threadId, 
  projectId, 
  onPreview 
}: { 
  file: { file_id: string; file_name: string; file_size: number };
  threadId: string | null;
  projectId: string | null;
  onPreview: (imageUrl: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Check if file is an image
  const isImage = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
  };

  const isImageFile = isImage(file.file_name);

  useEffect(() => {
    if (!threadId || !projectId) {
      setError(true);
      setLoading(false);
      return;
    }

    // Only fetch if it's an image
    if (!isImageFile) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const params = new URLSearchParams({
          thread_id: threadId,
          project_id: projectId,
        });
        const apiKey = localStorage.getItem('helium_api_key');
        const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
        
        const response = await fetch(
          `/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setImageUrl(url);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup
    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file.file_id, threadId, projectId, isImageFile]);

  const handleClick = async () => {
    if (isImageFile && imageUrl && !loading && !error) {
      onPreview(imageUrl);
    } else if (!isImageFile && threadId && projectId) {
      // Download non-image files
      try {
        const params = new URLSearchParams({
          thread_id: threadId,
          project_id: projectId,
        });
        const apiKey = localStorage.getItem('helium_api_key');
        const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
        
        const response = await fetch(
          `/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error('Failed to download file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert(`Failed to download file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  if (loading && isImageFile) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm opacity-50 cursor-not-allowed"
      >
        <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
        <span className="font-medium text-gray-900 truncate max-w-[200px]">
          {file.file_name}
        </span>
      </button>
    );
  }

  if (error && isImageFile) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm opacity-50 cursor-not-allowed"
      >
        {getFileIcon(file.file_name)}
        <span className="font-medium text-gray-900 truncate max-w-[200px]">
          {file.file_name}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-sm transition-colors"
    >
      {getFileIcon(file.file_name)}
      <span className="font-medium text-gray-900 truncate max-w-[200px]">
        {file.file_name}
      </span>
      <span className="text-xs text-gray-500">
        {formatFileSize(file.file_size)}
      </span>
    </button>
  );
}

export function FileList({ files, threadId, projectId }: FileListProps) {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
    fileId: string;
  } | null>(null);

  if (!files || files.length === 0) {
    return null;
  }

  // Check if file is an image
  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
  };

  // Check if file is a video
  const isVideoFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
  };

  // Check if file is audio
  const isAudioFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext);
  };

  // Check if file is a PDF
  const isPDFFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ext === 'pdf';
  };

  const handleFileClick = async (file: { file_id: string; file_name: string }) => {
    if (!threadId || !projectId) {
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
        const apiKey = localStorage.getItem('helium_api_key');
        const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
        const response = await fetch(`/api/files/${encodeURIComponent(file.file_id)}?${params.toString()}`, {
          headers,
        });

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
        alert(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return;
    }

    // For non-image files, download directly
    if (!threadId || !projectId) {
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

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!threadId || !projectId) {
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
      const apiKey = localStorage.getItem('helium_api_key');
      const headers: HeadersInit = apiKey ? { 'x-helium-api-key': apiKey } : {};
      const response = await fetch(`/api/files/${encodeURIComponent(fileId)}?${params.toString()}`, {
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
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
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
      <div className="w-full">
        {/* Display all files in capsule format */}
        <div className="flex flex-wrap gap-2">
          {files.map((file) => {
            return (
              <ImagePreview
                key={file.file_id}
                file={file}
                threadId={threadId}
                projectId={projectId}
                onPreview={(imageUrl) => {
                  setPreviewImage({
                    url: imageUrl,
                    fileName: file.file_name,
                    fileId: file.file_id,
                  });
                }}
              />
            );
          })}
        </div>
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
