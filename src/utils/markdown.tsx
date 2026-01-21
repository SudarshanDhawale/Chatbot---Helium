/**
 * Simple markdown renderer for chat messages
 */

'use client';

import React from 'react';

export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // First, remove function calls and XML blocks (hide technical details from user)
  let cleanedText = text;
  
  // Remove function_calls blocks
  cleanedText = cleanedText.replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '');
  
  // Remove standalone invoke blocks
  cleanedText = cleanedText.replace(/<invoke[\s\S]*?<\/invoke>/gi, '');
  
  // Remove XML/code blocks that contain function calls
  cleanedText = cleanedText.replace(/```xml\s*<function_calls>[\s\S]*?<\/function_calls>\s*```/gi, '');
  cleanedText = cleanedText.replace(/```xml\s*<invoke[\s\S]*?<\/invoke>\s*```/gi, '');
  
  // Remove "XMLCopy" text artifacts
  cleanedText = cleanedText.replace(/XMLCopy/g, '');
  
  // Remove "Completed" status messages that appear after function calls
  cleanedText = cleanedText.replace(/^Completed\s*$/gm, '');
  
  // Clean up multiple consecutive newlines
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleanedText = cleanedText.trim();

  // Parse the cleaned text
  const textParts = parseTextContent(cleanedText);
  const elements: React.ReactNode[] = [];
  
  textParts.forEach((textPart, textIndex) => {
    if (textPart.type === 'linebreak') {
      elements.push(<br key={`br-${textIndex}`} />);
    } else if (textPart.type === 'list') {
      elements.push(
        <div key={`list-${textIndex}`} className="flex items-start my-1">
          <span className="mr-2 mt-0.5 text-blue-accent font-bold">•</span>
          <span className="text-text-primary">{formatLine(textPart.content)}</span>
        </div>
      );
    } else {
      elements.push(
        <span key={`text-${textIndex}`} className="leading-relaxed text-text-primary">
          {formatLine(textPart.content)}
        </span>
      );
    }
  });
  
  return <>{elements}</>;
}

interface TextPart {
  type: 'text' | 'linebreak' | 'list';
  content: string;
}

function parseTextContent(text: string): TextPart[] {
  const lines = text.split('\n');
  const parts: TextPart[] = [];
  
  lines.forEach((line) => {
    if (line.trim() === '') {
      parts.push({ type: 'linebreak', content: '' });
      return;
    }
    
    // Check if it's a list item
    const listMatch = line.match(/^[-•*]\s+(.+)$/);
    if (listMatch) {
      parts.push({ type: 'list', content: listMatch[1] });
    } else {
      parts.push({ type: 'text', content: line });
    }
  });
  
  return parts;
}

function formatLine(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  
  // Combined regex for bold, italic, and links
  // Matches: **bold**, *italic*, [link text](url)
  const combinedRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let match;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }
    
    if (match[1]) {
      // Bold text (**text**)
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-text-primary">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text (*text*)
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic text-text-primary">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Link [text](url)
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-accent hover:text-blue-accent-hover underline transition-colors duration-150"
        >
          {match[6]}
        </a>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${keyIndex++}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}
