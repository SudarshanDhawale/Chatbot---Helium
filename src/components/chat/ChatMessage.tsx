/**
 * Chat message component
 */

'use client';

import { useEffect, useState } from 'react';
import { formatTimestamp } from '@/utils/format';
import { renderMarkdown } from '@/utils/markdown';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { FileList } from './FileList';
import { ToolExecutionStatus } from './ToolExecutionStatus';
import { MessageActions } from './MessageActions';
import { ImagePreviewModal } from './ImagePreviewModal';

// Loader styles - smooth bouncing dots animation matching new theme
const loaderStyles = `
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.7;
    }
    30% {
      transform: translateY(-8px) scale(1.1);
      opacity: 1;
    }
  }
  .bouncing-dots {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 16px;
  }
  .bouncing-dots div {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #3b82f6;
    animation: bounce 1.2s ease-in-out infinite both;
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
  }
  .bouncing-dots div:nth-child(1) {
    animation-delay: 0s;
  }
  .bouncing-dots div:nth-child(2) {
    animation-delay: 0.2s;
  }
  .bouncing-dots div:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

interface ChatMessageProps {
  message: ChatMessageType;
  threadId?: string | null | undefined;
  projectId?: string | null | undefined;
}

export function ChatMessage({ message, threadId, projectId }: ChatMessageProps) {
  const isUser = message.role === 'user';
  console.log('ChatMessage render:', message.id, message.role, isUser, message.uploadedFiles);
  const isError = message.status === 'error';
  const isStopped = message.status === 'stopped';
  const isLoading = message.status === 'sending' || message.status === 'running';
  const showSpinner = !isUser && isLoading;
  const [isHovering, setIsHovering] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; fileName: string } | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  
  // Clean up object URLs on unmount
  useEffect(() => {
    if (isUser && message.uploadedFiles) {
      return () => {
        // Clean up object URLs when component unmounts
        message.uploadedFiles?.forEach((file) => {
          if (file.url) {
            URL.revokeObjectURL(file.url);
          }
        });
      };
    }
  }, [isUser, message.uploadedFiles]);

  return (
    <>
      <style>{loaderStyles}</style>
      <div className={`flex w-full mb-2 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className="flex flex-col gap-2 max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          {/* Message Card */}
          <div
            className={`rounded-2xl px-5 py-4 backdrop-blur-md ${
              isUser
                ? 'bg-blue-accent/20 text-text-primary'
                : isError
                ? 'bg-red-900/30 text-red-300 border border-red-800'
                : 'bg-navy-800/60 text-text-primary'
            }`}
            onMouseEnter={() => !isUser && setIsHovering(true)}
            onMouseLeave={() => !isUser && setIsHovering(false)}
          >
          {/* Message header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold opacity-70">
              {isUser ? 'You' : 'HELIUM'}
            </span>
            {/* Timestamp - hidden on mobile */}
            <span className="hidden sm:block text-xs font-normal opacity-70">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Uploaded images - show at top for user messages */}
          {(() => {
            console.log('ChatMessage uploadedFiles check:', isUser, message.uploadedFiles, message.uploadedFiles?.length, message.id, message.content);
            return isUser && message.uploadedFiles && message.uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 max-w-full">
                {message.uploadedFiles.map((file, index) => {
                  console.log('Rendering uploaded file:', file.name, file.type, file.url);
                  const isImage = file.type.startsWith('image/');
                  console.log('Is image:', isImage);
                  const imageKey = `${file.name}-${index}`;

                  return (
                    <div
                      key={imageKey}
                      className="relative inline-block rounded-lg overflow-hidden border border-navy-700 max-w-full"
                    >
                      {isImage && file.url ? (
                        <div className="relative">
                          {/* Loading state */}
                          {imageLoadingStates[imageKey] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-navy-800/80 backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-accent border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-text-secondary">Loading...</span>
                              </div>
                            </div>
                          )}
                          {/* Image with max-width constraint and click-to-expand */}
                          <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxWidth: '100%' }}
                            onLoad={() => {
                              setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
                            }}
                            onLoadStart={() => {
                              setImageLoadingStates(prev => ({ ...prev, [imageKey]: true }));
                            }}
                            onClick={() => {
                              setImagePreview({ url: file.url!, fileName: file.name });
                            }}
                            onError={(e) => {
                              console.log('Image failed to load:', file.url, file.name);
                              setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
                              // Hide the broken image and show fallback
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement?.parentElement;
                              if (parent) {
                                const fallback = parent.querySelector('.file-fallback');
                                if (fallback) (fallback as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      {/* Fallback for non-images or failed images */}
                      <div className="file-fallback flex items-center gap-2 bg-navy-800 px-3 py-2 max-w-full" style={{ display: isImage && file.url ? 'none' : 'flex' }}>
                        <svg
                          className="w-4 h-4 text-text-secondary flex-shrink-0"
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
                        <span className="text-xs font-medium text-text-primary truncate max-w-[150px]">
                          {file.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}


          {/* Tool execution statuses - show all tools (running and completed) */}
          {!isUser && message.toolExecutions && message.toolExecutions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.toolExecutions.map((tool, index) => (
                <ToolExecutionStatus
                  key={`${tool.function_name}-${index}`}
                  toolName={tool.function_name}
                  description={tool.description}
                  status={tool.status}
                />
              ))}
            </div>
          )}

        {/* Message content */}
        <div className="break-words overflow-wrap-anywhere leading-relaxed">
          {!isUser ? renderMarkdown(message.content) : <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</div>}
          {/* Loading dots inline with text */}
          {showSpinner && !isUser && (
            <span className="inline-flex items-center ml-1">
              <div className="bouncing-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </span>
          )}
        </div>

        {/* Checkmark - only when agent execution is truly completed */}
        {!isUser && 
         message.status === 'completed' && 
         message.content && 
         message.content.trim().length > 0 &&
         !showSpinner &&
         !isLoading &&
         (!message.toolExecutions || message.toolExecutions.length === 0 || message.toolExecutions.every(tool => tool.status === 'completed' || tool.status === 'failed')) && (
          <div className="mt-2 flex items-center gap-1.5 justify-end">
            <span className="text-xs text-green-400 font-medium">Completed</span>
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Agent execution completed"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Error message */}
        {message.error && (
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
            <svg
              className="w-4 h-4 text-red-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Error"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message.error}</span>
          </div>
        )}

        {/* Code blocks - HIDDEN, user doesn't need to see code */}
        {/* Code blocks are intentionally not displayed */}

        {/* Files */}
        {(() => {
          console.log('ChatMessage files check:', message.files, message.files?.length, message.id);
          return message.files && message.files.length > 0 && (
            <div className="mt-2">
              <FileList
                files={message.files}
                threadId={threadId !== undefined ? threadId : null}
                projectId={projectId !== undefined ? projectId : null}
              />
            </div>
          );
        })()}
        </div>

        {/* Message Actions - outside the card, below it - only for assistant messages */}
        {!isUser && (
          <MessageActions
            messageId={message.id}
            content={message.content}
            visible={isHovering}
            disabled={isLoading}
          />
        )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <ImagePreviewModal
          isOpen={!!imagePreview}
          onClose={() => setImagePreview(null)}
          imageUrl={imagePreview.url}
          fileName={imagePreview.fileName}
        />
      )}
    </>
  );
}
