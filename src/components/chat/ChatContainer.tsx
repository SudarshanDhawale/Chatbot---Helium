/**
 * Main chat container component
 */

'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatContainerProps {
  messages: ChatMessageType[];
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  threadId?: string | null;
  projectId?: string | null;
  userName?: string;
}

export function ChatContainer({
  messages,
  onSend,
  onStop,
  disabled = false,
  isLoading = false,
  threadId,
  projectId,
  userName,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col h-full bg-navy-900 overflow-x-hidden ${hasMessages ? '' : 'justify-center'}`}>
      {/* Messages area */}
      {hasMessages && (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-transparent mx-auto w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl scrollbar-hide space-y-4 scroll-smooth"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} threadId={threadId} projectId={projectId} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Welcome message - shown only when no messages */}
      {!hasMessages && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center px-4 mb-32">
            <h2 className="text-2xl font-bold mb-2 text-text-primary">
              Welcome{userName ? `, ${userName}` : ''}
            </h2>
            <p className="text-base font-normal text-text-secondary">
              Start a conversation by describing what you'd like to build
            </p>
          </div>
        </div>
      )}

      {/* Input area - always positioned at bottom */}
      <div className="mt-auto transition-all duration-500 ease-in-out">
        <ChatInput 
          onSend={onSend} 
          onStop={onStop}
          disabled={disabled} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
