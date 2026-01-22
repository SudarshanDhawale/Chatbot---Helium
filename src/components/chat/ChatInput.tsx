/**
 * Chat input component
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';

// Input field styles
const inputStyles = `
  .chat-outer-card {
    background: rgba(235, 247, 255, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 28px;
    padding: 20px;
    box-shadow: 0 10px 40px rgba(156, 163, 175, 0.25), 0 4px 12px rgba(156, 163, 175, 0.15);
  }
  .chat-input-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(156, 163, 175, 0.15);
  }
  .chat-input {
    font-family: "Montserrat", sans-serif;
    width: 100%;
    min-height: 20px;
    max-height: 300px;
    padding: 0;
    border: 0;
    background: transparent;
    outline: none;
    color: #1f2937;
    resize: none;
    overflow-y: auto;
    line-height: 1.4;
    font-size: 15px;
  }
  .chat-input::placeholder {
    color: #9ca3af;
  }
  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .suggestion-chip {
    background: rgba(229, 231, 235, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 20px;
    padding: 10px 18px;
    font-size: 14px;
    color: #4b5563;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .suggestion-chip:hover {
    background: rgba(209, 213, 219, 0.9);
    transform: translateY(-1px);
  }
  .suggestion-chip:active {
    transform: translateY(0);
  }
`;

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasMessages?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isLoading = false,
  hasMessages = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      // Simulate file upload progress
      if (files.length > 0) {
        setUploadingFiles(true);
        // Simulate upload delay
        setTimeout(() => {
          setUploadingFiles(false);
          onSend(message, files.length > 0 ? files : undefined);
          setMessage('');
          setFiles([]);
          // Reset textarea height to initial state
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }, 500);
      } else {
        onSend(message, files.length > 0 ? files : undefined);
        setMessage('');
        setFiles([]);
        // Reset textarea height to initial state
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTextareaResize = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate the new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Set max height (approximately 10 lines)
      const maxHeight = 300;
      
      // Set height to scrollHeight, but cap at maxHeight
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  return (
    <>
      <style>{inputStyles}</style>
      <form onSubmit={handleSubmit} className="p-6 w-full max-w-full overflow-x-hidden">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full gap-4">
          
          {/* File preview - moved above text field */}
          {files.length > 0 && (
            <div className="w-full flex flex-wrap gap-2">
              {uploadingFiles && (
                <div className="w-full flex items-center justify-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-600">Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...</span>
                </div>
              )}
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <span className="text-gray-700 font-medium truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploadingFiles}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-150 ease-in-out flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Outer gray card container */}
          <div className="chat-outer-card w-full">
            {/* Inner white card - only text field */}
            <div className="chat-input-card w-full mb-2">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTextareaResize();
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled || uploadingFiles}
                placeholder="Search for anything..."
                className="chat-input"
              />
            </div>
            
            {/* Bottom action bar - on gray background */}
            <div className="flex items-center justify-between px-1">
              {/* Left side - Clip/Attach button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploadingFiles}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out rounded-full hover:bg-gray-100 active:scale-95"
                aria-label="Attach file"
              >
                <img 
                  src="/assets/icons/clip.png" 
                  alt="Attach" 
                  className="w-5 h-5 object-contain"
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || uploadingFiles}
              />

              {/* Right side - Send button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  disabled={!onStop}
                  className="w-9 h-9 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center shadow-lg active:scale-95"
                  aria-label="Stop generation"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={disabled || uploadingFiles || (!message.trim() && files.length === 0)}
                  className="w-9 h-9 bg-gray-200 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center shadow-lg active:scale-95"
                  aria-label="Send message"
                >
                  {uploadingFiles ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <img 
                      src="/assets/icons/send.png" 
                      alt="Send" 
                      className="w-5 h-5 object-contain"
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
