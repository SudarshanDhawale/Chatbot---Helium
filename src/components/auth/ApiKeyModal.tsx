/**
 * API Key Modal Component
 * Prompts user to enter their Helium API key on first visit
 */

'use client';

import { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onValidKey: (apiKey: string) => void;
  currentApiKey?: string | null;
  onClose?: () => void;
}

export function ApiKeyModal({ isOpen, onValidKey, currentApiKey, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with current API key if it exists
      setApiKey(currentApiKey || '');
      setError(null);
    }
  }, [isOpen, currentApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('he-')) {
      setError('Invalid API key format. API key must start with "he-"');
      return;
    }

    // Just store the key - validation will happen when user tries to use it
    onValidKey(apiKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-200 to-blue-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-black">
                {currentApiKey ? 'Update API Key' : 'Welcome to Helium Chat'}
              </h2>
              <p className="text-black text-sm mt-1">
                {currentApiKey ? 'Enter a new API key to update' : 'Enter your API key to get started'}
              </p>
            </div>
            {/* Close button - only show if there's already an API key */}
            {currentApiKey && onClose && (
              <button
                onClick={onClose}
                className="ml-4 p-1 text-black hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
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
            )}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Helium API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://he2.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                he2.ai
              </a>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            {currentApiKey ? 'Update API Key' : 'Continue'}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-[11px] text-gray-600">
            Your API key is stored locally in your browser and will be validated when you send your first message.
          </p>
        </div>
      </div>
    </div>
  );
}
