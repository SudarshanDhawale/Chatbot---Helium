/**
 * Chat input component
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import TextType from '@/components/ui/TextType';
import '@/components/ui/TextType.css';

// Input field styles
const inputStyles = `
  .chat-input-group {
    display: flex;
    line-height: 28px;
    align-items: center;
    position: relative;
    max-width: 100%;
  }
  .chat-input {
    font-family: "Montserrat", sans-serif;
    width: 100%;
    min-height: 45px;
    max-height: calc(1.5em * 6 + 1.5rem);
    padding-left: 2rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    box-shadow: 0 0 0 1.5px rgba(63, 63, 63, 0.5);
    border: 0;
    border-radius: 1.5rem;
    background-color: rgba(47, 47, 47, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    outline: none;
    color: #ececec;
    transition: height 0.2s ease-in-out, box-shadow 0.25s cubic-bezier(0.19, 1, 0.22, 1), background-color 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    cursor: text;
    z-index: 0;
    resize: none;
    overflow-y: auto;
    line-height: 1.5em;
  }
  .chat-input::placeholder {
    color: #8e8e8e;
  }
  .chat-input:hover {
    box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.3);
    background-color: rgba(47, 47, 47, 0.7);
  }
  .chat-input:active {
    transform: scale(0.98);
  }
  .chat-input:focus {
    box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.5);
    background-color: rgba(47, 47, 47, 0.8);
  }
  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isLoading = false
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
      
      // Calculate max height (6 lines: line-height * 6 + padding)
      // line-height is 1.5em (24px at 16px base), padding is 0.75rem top + 0.75rem bottom = 1.5rem (24px)
      const lineHeight = 24; // 1.5em at 16px base font
      const padding = 24; // 0.75rem top + 0.75rem bottom
      const maxHeight = (lineHeight * 6) + padding;
      
      // Set height to scrollHeight, but cap at maxHeight
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  return (
    <>
      <style>{inputStyles}</style>
      <form onSubmit={handleSubmit} className="p-6 w-full max-w-full overflow-x-hidden border-t border-navy-700">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full">
          {/* File preview */}
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 justify-center w-full max-w-full">
              {uploadingFiles && (
                <div className="w-full flex items-center justify-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-accent border-t-transparent"></div>
                  <span className="text-sm text-text-secondary">Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...</span>
                </div>
              )}
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-navy-800/60 backdrop-blur-md border border-navy-700 rounded-2xl px-3 py-2 text-sm max-w-full"
                >
                  <span className="text-text-primary font-medium truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploadingFiles}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 w-full justify-center max-w-full">
            {/* File input button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadingFiles}
              className="flex items-center justify-center w-11 h-11 text-text-secondary hover:text-blue-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out rounded-full hover:bg-navy-800/60 hover:backdrop-blur-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
              aria-label="Attach file"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || uploadingFiles}
            />

            {/* Text input with new styling */}
            <div className="chat-input-group flex-1 max-w-2xl relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTextareaResize();
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled || uploadingFiles}
                rows={1}
                className="chat-input"
              />
              {/* Typing animation placeholder */}
              {message.trim() === '' && !disabled && !uploadingFiles && (
                <div className="absolute inset-0 flex items-center pointer-events-none pl-8 pr-4">
                  <TextType
                    text={["How does gravity actually work?","Are we alone in the universe?", "Ask me anything...", "What can I help you with?","What is the capital of the USA?"]}
                    typingSpeed={50}
                    pauseDuration={2000}
                    showCursor
                    cursorCharacter="▎"
                    deletingSpeed={30}
                    variableSpeed={undefined}
                    onSentenceComplete={undefined}
                    className="text-text-secondary text-sm font-normal"
                    cursorClassName="text-text-secondary"
                  />
                </div>
              )}
            </div>

            {/* Send/Stop button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                disabled={!onStop}
                className="w-11 h-11 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                aria-label="Stop generation"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={disabled || uploadingFiles || (!message.trim() && files.length === 0)}
                className="w-11 h-11 bg-blue-accent text-white rounded-full hover:bg-blue-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
                aria-label="Send message"
              >
                {uploadingFiles ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg
                    className="w-5 h-5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
