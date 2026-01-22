/**
 * Code block component with syntax highlighting and theme-matching colors
 */

'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Fallback component for when syntax highlighting fails
function PlainCodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: '1rem',
        background: 'transparent',
        fontSize: '0.875rem',
        lineHeight: '1.625',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        color: '#d4d4d4',
        whiteSpace: 'pre',
        overflowX: 'auto',
        tabSize: 4,
      }}
    >
      <code style={{ tabSize: 4 }}>{code}</code>
    </pre>
  );
}

// Component that safely renders syntax highlighting with fallback
function SafeSyntaxHighlighter({ language, code }: { language: string; code: string }) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when language or code changes
  useEffect(() => {
    setHasError(false);
  }, [language, code]);

  if (hasError) {
    return <PlainCodeBlock code={code} />;
  }

  try {
    return (
      <SyntaxHighlighter
        language={language}
        style={prism}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#f3f4f6', // grey background
          fontSize: '0.875rem',
          lineHeight: '1.625',
          whiteSpace: 'pre',
          tabSize: 4,
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            tabSize: 4,
            color: '#000000', // black text
          }
        }}
        wrapLines={false}
        wrapLongLines={false}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    );
  } catch (error) {
    // If SyntaxHighlighter throws during render, fall back to plain code
    console.warn(`Syntax highlighting failed for language "${language}":`, error);
    return <PlainCodeBlock code={code} />;
  }
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const displayName = getLanguageDisplayName(language || 'code');
  const [copied, setCopied] = useState(false);
  const isEmpty = code === '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code to clipboard:', error);
      // Maintain original button state on error (don't set copied to true)
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-navy-700 bg-navy-950/80 backdrop-blur-sm">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-navy-950/60 border-b border-navy-100">
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
      
      {/* Code content with syntax highlighting and fallback */}
      <div 
        className="overflow-x-auto overflow-y-auto"
        style={{
          maxHeight: '500px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2)',
        }}
      >
        {isEmpty ? (
          <div 
            className="flex items-center justify-center text-text-secondary italic"
            style={{
              padding: '2rem 1rem',
              minHeight: '4rem',
            }}
          >
            Empty code block
          </div>
        ) : (
          <SafeSyntaxHighlighter language={language} code={code} />
        )}
      </div>
    </div>
  );
}
