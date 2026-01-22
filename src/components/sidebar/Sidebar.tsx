/**
 * Sidebar component with hover-based drawer functionality
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { ThreadSummary } from '@/types/thread';

interface SidebarProps {
  threads?: ThreadSummary[];
  onThreadDeleted?: () => void;
}

export function Sidebar({ threads = [], onThreadDeleted }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<ThreadSummary | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  const currentThreadId = params?.threadId as string | undefined;

  // Handle hover detection for opening/closing sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const hoverThreshold = 50; // pixels from left edge to trigger open
      const sidebarWidth = 256; // 64 * 4 = 256px (w-64)
      const closeThreshold = sidebarWidth + 50; // pixels from left edge to trigger close

      // Open sidebar when hovering near left edge
      if (e.clientX <= hoverThreshold && !isHovered) {
        setIsHovered(true);
      }
      // Close sidebar when mouse moves away from sidebar area
      else if (e.clientX > closeThreshold && isHovered) {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleThreadClick = (thread: ThreadSummary) => {
    router.push(`/project/${thread.projectId}/thread/${thread.threadId}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteClick = (e: React.MouseEvent, thread: ThreadSummary) => {
    e.stopPropagation();
    setThreadToDelete(thread);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThreadId(threadToDelete.threadId);
      const { DBClient } = await import('@/lib/db-client');
      await DBClient.deleteThread(threadToDelete.threadId);
      
      // If we're currently viewing the deleted thread, redirect to home
      if (currentThreadId === threadToDelete.threadId) {
        router.push('/');
      }
      
      // Notify parent to refresh thread list
      if (onThreadDeleted) {
        onThreadDeleted();
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingThreadId(null);
      setShowDeleteConfirm(false);
      setThreadToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setThreadToDelete(null);
  };

  return (
    <>
      {/* Hover trigger zone - invisible area on left edge */}
      <div
        ref={hoverZoneRef}
        className="fixed top-0 left-0 w-12 h-full z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Overlay - only visible on mobile when sidebar is hovered */}
      {isHovered && (
        <div
          onClick={() => setIsHovered(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out w-64
          ${isHovered ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          </div>

          {/* Sidebar Content */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {/* Home */}
              <li>
                <button
                  onClick={handleHomeClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2"
                    fill="none"
                    stroke="currentColor"
                    className="w-5 h-5 flex-shrink-0"
                  >
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <span className="font-medium">New Chat</span>
                </button>
              </li>

              {/* Thread List Section */}
              {threads.length > 0 && (
                <>
                  <li className="pt-4 pb-2">
                    <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Recent Conversations
                    </div>
                  </li>
                  {threads.map((thread) => (
                    <li key={thread.threadId}>
                      <div className="relative group">
                        <button
                          onClick={() => handleThreadClick(thread)}
                          disabled={deletingThreadId === thread.threadId}
                          className={`
                            w-full flex flex-col gap-1 px-3 py-2 rounded-lg
                            text-left transition-colors duration-150
                            ${deletingThreadId === thread.threadId ? 'opacity-50 cursor-not-allowed' : ''}
                            ${currentThreadId === thread.threadId 
                              ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }
                          `}
                          title={thread.title}
                        >
                          <div className="flex items-start gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth="2"
                              fill="none"
                              stroke="currentColor"
                              className="w-4 h-4 flex-shrink-0 mt-0.5"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span className="text-sm font-medium truncate flex-1">
                              {thread.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 pl-6">
                            <span>{formatDate(thread.lastUpdated)}</span>
                            <span>{thread.messageCount} messages</span>
                          </div>
                        </button>
                        
                        {/* Delete button - appears on hover */}
                        <button
                          onClick={(e) => handleDeleteClick(e, thread)}
                          disabled={deletingThreadId === thread.threadId}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 
                                   bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700
                                   transition-all duration-150 disabled:opacity-50"
                          title="Delete conversation"
                          aria-label="Delete conversation"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2"
                            fill="none"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M4 7h16"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"></path>
                            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-gray-200">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <span className="font-medium">Help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && threadToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-red-600"
                >
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3.6 9h16.8a1 1 0 0 1 .9 1.4l-8.4 14a1 1 0 0 1-1.8 0l-8.4-14A1 1 0 0 1 3.6 9z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Conversation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete "{threadToDelete.title}"? This action cannot be undone and all messages will be permanently deleted.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingThreadId === threadToDelete.threadId}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingThreadId === threadToDelete.threadId ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
