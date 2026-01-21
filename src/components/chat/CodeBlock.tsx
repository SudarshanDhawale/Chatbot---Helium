/**
 * Code block component with syntax highlighting and theme-matching colors
 */

'use client';

import { useState } from 'react';

// Get a friendly display name for the language
function getLanguageDisplayName(lang: string): string {
  const langMap: Record<string, string> = {
    'python': 'Python',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'bash': 'Bash',
    'shell': 'Shell',
    'xml': 'XML',
    'text': 'Code',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'sql': 'SQL',
    'yaml': 'YAML',
    'markdown': 'Markdown',
  };
  return langMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const displayName = getLanguageDisplayName(language || 'code');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-navy-700 bg-navy-950/80 backdrop-blur-sm">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-navy-950/60 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            {displayName}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-navy-800 rounded transition-all duration-150"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content with monospace font */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono text-text-primary whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
