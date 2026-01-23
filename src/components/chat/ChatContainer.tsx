/**
 * Main chat container component
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import TextType from '@/components/ui/TextType';
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
  const userScrolledRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Check if user is near the bottom of the scroll container
  const isNearBottom = () => {
    if (!containerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 150; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Handle scroll events to detect manual scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollingUp = currentScrollTop < lastScrollTopRef.current;
      const nearBottom = isNearBottom();
      
      // If user scrolls up manually, mark as user-scrolled
      if (scrollingUp) {
        userScrolledRef.current = true;
      }
      
      // If user scrolls back to near bottom, reset the flag
      if (nearBottom) {
        userScrolledRef.current = false;
      }
      
      // Show/hide scroll button based on position
      setShowScrollButton(!nearBottom && messages.length > 0);
      
      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Smart auto-scroll: only scroll if user hasn't manually scrolled up
  useEffect(() => {
    // Only auto-scroll if user is near the bottom or hasn't scrolled up
    if (!userScrolledRef.current || isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col h-full bg-white ${hasMessages ? '' : 'justify-center'}`}>
      {/* Messages area */}
      {hasMessages && (
        <div className="relative flex-1 min-h-0">
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 bg-transparent"
          >
            <div className="mx-auto w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} threadId={threadId} projectId={projectId} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={() => {
                userScrolledRef.current = false;
                scrollToBottom('smooth');
              }}
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 rounded-full p-3 shadow-[0_4px_12px_rgba(156,163,175,0.4)] border border-gray-200 transition-all duration-200 hover:shadow-[0_6px_16px_rgba(156,163,175,0.5)] hover:scale-105 z-10"
              aria-label="Scroll to bottom"
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Welcome message - shown only when no messages */}
      {!hasMessages && (
        <div className="absolute inset-0 flex flex-col items-center pointer-events-none" style={{ paddingBottom: '500px' }}>
          <div className="text-center px-4 mt-auto mb-auto">
            <h2 className="text-4xl font-bold mb-2 text-gray-900">
              Welcome{userName ? `, ${userName}` : ''}
            </h2>
            <div className="text-lg font-normal text-gray-600 mt-5">
              <TextType
                text={[
                  "Start a conversation by describing what you'd like to build",
                  "Ask me anything about your project",
                  "Let's create something amazing together!",
                  "What can I help you build today?"
                ]}
                typingSpeed={50}
                pauseDuration={2000}
                showCursor
                cursorCharacter="_"
                deletingSpeed={30}
                className="text-gray-600"
                cursorClassName="text-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Input area - always positioned at bottom with blur effect */}
      <div className="flex-shrink-0 transition-all duration-500 ease-in-out relative">
        {/* Blur overlay for content scrolling underneath */}
        <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
        <ChatInput 
          onSend={onSend} 
          onStop={onStop}
          disabled={disabled} 
          isLoading={isLoading}
          hasMessages={hasMessages}
        />
      </div>
    </div>
  );
}
