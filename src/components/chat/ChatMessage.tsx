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
  const isError = message.status === 'error';
  const isStopped = message.status === 'stopped';
  const isLoading = message.status === 'sending' || message.status === 'running';
  const showSpinner = !isUser && isLoading && !isStopped;
  const [isHovering, setIsHovering] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; fileName: string } | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  return (
    <>
      <style>{loaderStyles}</style>
      <div className={`flex w-full mb-2 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div 
          className="flex flex-col gap-2 max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
          onMouseEnter={() => !isUser && setIsHovering(true)}
          onMouseLeave={() => !isUser && setIsHovering(false)}
        >
          {/* Message Card */}
          <div
            className={`rounded-2xl px-5 py-4 backdrop-blur-md border ${
              isUser
                ? 'bg-[rgba(222, 241, 255, 0.6)] text-gray-900 border-blue-200 shadow-[0_4px_6px_-1px_rgba(156,163,175,0.3),0_2px_4px_-1px_rgba(156,163,175,0.2)]'
                : isError
                ? 'bg-red-50 text-red-700 border-red-300 shadow-[0_4px_6px_-1px_rgba(156,163,175,0.3),0_2px_4px_-1px_rgba(156,163,175,0.2)]'
                : isStopped
                ? 'bg-yellow-50 text-yellow-900 border-yellow-300 shadow-[0_4px_6px_-1px_rgba(156,163,175,0.3),0_2px_4px_-1px_rgba(156,163,175,0.2)]'
                : 'bg-white text-black border-gray-200 shadow-[0_4px_6px_-1px_rgba(156,163,175,0.3),0_2px_4px_-1px_rgba(156,163,175,0.2)]'
            }`}
          >
          {/* Message header */}
          <div className="flex items-center mb-1">
            <span className="text-xs font-semibold opacity-70">
              {isUser ? 'You' : 'HELIUM'}
            </span>
          </div>

          {/* Uploaded files - show as capsules for user messages */}
          {(() => {
            return isUser && message.uploadedFiles && message.uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 max-w-full">
                {message.uploadedFiles.map((file, index) => {
                  const isImage = file.type.startsWith('image/');
                  const imageKey = `${file.name}-${index}`;
                  
                  // Generate URL for the file
                  const fileUrl = file.file_id && threadId && projectId
                    ? `/api/files/${encodeURIComponent(file.file_id)}?thread_id=${threadId}&project_id=${projectId}`
                    : file.url;

                  // Get file icon based on type
                  const getUploadedFileIcon = () => {
                    if (isImage) {
                      return (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                        </svg>
                      );
                    }
                    return (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  };

                  return (
                    <button
                      key={imageKey}
                      onClick={() => {
                        if (isImage && fileUrl) {
                          setImagePreview({ url: fileUrl, fileName: file.name });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-sm transition-colors"
                    >
                      {getUploadedFileIcon()}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </button>
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
        </div>

        {/* Checkmark - only when agent execution is truly completed */}
        {!isUser && 
         message.status === 'completed' && 
         message.content && 
         message.content.trim().length > 0 &&
         !showSpinner &&
         !isLoading &&
         (!message.toolExecutions || message.toolExecutions.length === 0 || message.toolExecutions.every(tool => tool.status === 'completed' || tool.status === 'failed')) ? null : null}

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

        {/* Files - Always show if present */}
        {(() => {
          return message.files && message.files.length > 0 && (
            <div className="mt-3">
              <FileList
                files={message.files}
                threadId={threadId !== undefined ? threadId : null}
                projectId={projectId !== undefined ? projectId : null}
              />
            </div>
          );
        })()}

        {/* Timestamp at bottom-left with status on the right */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] font-normal opacity-50">
            {formatTimestamp(message.timestamp)}
          </span>
          {/* Loading dots or Completed status - only for AI messages */}
          {!isUser && (
            <div className="flex items-center gap-1.5">
              {/* Show loading dots while response is being generated OR any tools are running */}
              {(message.status === 'sending' || 
                message.status === 'running' || 
                (message.toolExecutions && message.toolExecutions.some(tool => tool.status === 'running'))) && (
                <div className="bouncing-dots scale-50">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              )}
              {/* Show stopped indicator */}
              {isStopped && (
                <>
                  <span className="text-[10px] text-yellow-600 font-medium">Agent Stopped</span>
                  <svg
                    className="w-3 h-3 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Agent stopped"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
              {/* Show completed checkmark ONLY when:
                  1. Message status is 'completed'
                  2. Message has content
                  3. NO tools are running (all tools must be completed or failed)
              */}
              {message.status === 'completed' && 
               message.content && 
               message.content.trim().length > 0 &&
               (!message.toolExecutions || !message.toolExecutions.some(tool => tool.status === 'running')) && (
                <>
                  <span className="text-[10px] text-green-500 font-medium">Completed</span>
                  <svg
                    className="w-3 h-3 text-green-500"
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
                </>
              )}
            </div>
          )}
        </div>
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
