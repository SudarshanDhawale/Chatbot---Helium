/**
 * Sidebar component for displaying recent conversations
 */

'use client';

import { formatDate } from '@/utils/format';
import type { ThreadSummary } from '@/types/thread';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ThreadSummary[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string, projectId: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({
  isOpen,
  onClose,
  threads,
  currentThreadId,
  onSelectThread,
  onNewChat,
}: ConversationSidebarProps) {
  return (
    <>
      {/* Overlay backdrop with smooth fade transition - only on mobile */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar with smooth slide-in/slide-out transition */}
      {/* On mobile (<1024px): fixed overlay with slide animation */}
      {/* On desktop (≥1024px): hidden when closed */}
      <aside
        id="conversation-sidebar"
        className={`fixed top-0 left-0 h-full w-80 bg-navy-950 backdrop-blur-sm border-r border-navy-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Conversation history"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-navy-700">
            <h2 className="text-lg font-bold text-text-primary">Chat History</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewChat}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-navy-800 rounded-lg transition-all duration-200 ease-in-out"
                aria-label="New chat"
                title="New chat"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-navy-800 rounded-lg transition-all duration-200 ease-in-out"
                aria-label="Close sidebar"
                title="Close sidebar"
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

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {threads.length === 0 ? (
              <div className="p-5 text-center text-text-secondary">
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs font-normal mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="p-3">
                {threads.map((thread) => (
                  <button
                    key={thread.threadId}
                    onClick={() => onSelectThread(thread.threadId, thread.projectId)}
                    className={`w-full text-left p-4 rounded-xl mb-2 transition-all duration-200 ease-in-out ${
                      currentThreadId === thread.threadId
                        ? 'bg-blue-accent/10 border border-blue-accent/30 shadow-sm'
                        : 'hover:bg-navy-800/50 border border-transparent hover:border-navy-700/50'
                    }`}
                    aria-current={currentThreadId === thread.threadId ? 'true' : undefined}
                    aria-label={`${thread.title}. Last message: ${thread.lastMessage}. ${thread.messageCount} messages. Last updated ${formatDate(thread.lastUpdated)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            currentThreadId === thread.threadId
                              ? 'text-blue-accent'
                              : 'text-text-primary'
                          }`}
                        >
                          {thread.title}
                        </p>
                        <p
                          className={`text-xs font-normal mt-2 line-clamp-2 leading-relaxed ${
                            currentThreadId === thread.threadId
                              ? 'text-blue-accent/80'
                              : 'text-text-secondary'
                          }`}
                        >
                          {thread.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span
                            className={`text-xs font-normal ${
                              currentThreadId === thread.threadId
                                ? 'text-blue-accent/70'
                                : 'text-text-muted'
                            }`}
                          >
                            {formatDate(thread.lastUpdated)}
                          </span>
                          {/* Message count - hidden on mobile */}
                          {thread.messageCount > 0 && (
                            <>
                              <span
                                className={`hidden sm:inline text-xs ${
                                  currentThreadId === thread.threadId
                                    ? 'text-blue-accent/50'
                                    : 'text-text-muted/50'
                                }`}
                              >
                                •
                              </span>
                              <span
                                className={`hidden sm:inline text-xs font-normal ${
                                  currentThreadId === thread.threadId
                                    ? 'text-blue-accent/70'
                                    : 'text-text-muted'
                                }`}
                              >
                                {thread.messageCount} {thread.messageCount === 1 ? 'message' : 'messages'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTA Button */}
          <div className="sticky bottom-0 p-4 border-t border-navy-700 bg-navy-950">
            <button
              onClick={onNewChat}
              className="w-full py-3 px-4 bg-blue-accent hover:bg-blue-accent-hover text-white font-bold rounded-xl transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 shadow-lg"
              aria-label="New Chat"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
