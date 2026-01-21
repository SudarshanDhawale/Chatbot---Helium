/**
 * Message actions component for assistant messages
 * Provides thumbs up, thumbs down, and copy functionality
 */

'use client';

import { useState } from 'react';

interface MessageActionsProps {
  messageId: string;
  content: string;
  visible: boolean;
  disabled?: boolean;
}

export function MessageActions({ messageId, content, visible, disabled = false }: MessageActionsProps) {
  const [thumbsUpActive, setThumbsUpActive] = useState(false);
  const [thumbsDownActive, setThumbsDownActive] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleThumbsUp = () => {
    setThumbsUpActive(!thumbsUpActive);
    setThumbsDownActive(false);
    // TODO: Send feedback to backend
    console.log('Thumbs up for message:', messageId);
  };

  const handleThumbsDown = () => {
    setThumbsDownActive(!thumbsDownActive);
    setThumbsUpActive(false);
    // TODO: Send feedback to backend
    console.log('Thumbs down for message:', messageId);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div
      className={`hidden sm:flex items-center gap-2 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="toolbar"
      aria-label="Message actions"
    >
      {/* Thumbs Up Button */}
      <button
        onClick={handleThumbsUp}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all duration-150 hover:bg-navy-700/50 disabled:opacity-50 disabled:cursor-not-allowed ${
          thumbsUpActive ? 'text-blue-accent bg-navy-700/30' : 'text-text-secondary'
        }`}
        aria-label={thumbsUpActive ? "Remove positive feedback" : "Give positive feedback"}
        aria-pressed={thumbsUpActive}
        title={thumbsUpActive ? "Remove positive feedback" : "Give positive feedback"}
        type="button"
      >
        <svg
          className="w-4 h-4"
          fill={thumbsUpActive ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={thumbsUpActive ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
          />
        </svg>
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={handleThumbsDown}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all duration-150 hover:bg-navy-700/50 disabled:opacity-50 disabled:cursor-not-allowed ${
          thumbsDownActive ? 'text-red-400 bg-navy-700/30' : 'text-text-secondary'
        }`}
        aria-label={thumbsDownActive ? "Remove negative feedback" : "Give negative feedback"}
        aria-pressed={thumbsDownActive}
        title={thumbsDownActive ? "Remove negative feedback" : "Give negative feedback"}
        type="button"
      >
        <svg
          className="w-4 h-4"
          fill={thumbsDownActive ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={thumbsDownActive ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
          />
        </svg>
      </button>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all duration-150 hover:bg-navy-700/50 disabled:opacity-50 disabled:cursor-not-allowed ${
          copyFeedback ? 'text-green-400 bg-navy-700/30' : 'text-text-secondary'
        }`}
        aria-label={copyFeedback ? 'Copied!' : 'Copy message'}
        title={copyFeedback ? 'Copied!' : 'Copy message'}
        type="button"
      >
        {copyFeedback ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
