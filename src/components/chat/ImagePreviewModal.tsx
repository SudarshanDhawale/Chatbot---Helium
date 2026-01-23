/**
 * Image preview modal component
 */

'use client';

import { useEffect, useState } from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
  onDownload?: () => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  onDownload,
}: ImagePreviewModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <svg
              className="w-5 h-5 text-gray-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-base font-semibold text-gray-900 truncate">{fileName}</h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onDownload && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Download"
                title="Download image"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close"
              title="Close preview"
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
        </div>

        {/* Image content */}
        <div className="flex items-center justify-center p-6 bg-gray-50 overflow-auto flex-1">
          {imageError ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600">Failed to load image</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
