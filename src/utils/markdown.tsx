/**
 * Simple markdown renderer for chat messages
 */

'use client';

import React from 'react';
import { CodeBlock } from '@/components/chat/CodeBlock';

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
  const blocks = parseMarkdownBlocks(cleanedText);
  const elements: React.ReactNode[] = [];
  
  blocks.forEach((block, blockIndex) => {
    switch (block.type) {
      case 'code':
        // Render code blocks with the CodeBlock component
        elements.push(
          <div key={`code-${blockIndex}`} className="my-4">
            <CodeBlock 
              language={block.language || 'text'} 
              code={block.code || ''} 
            />
          </div>
        );
        break;
      case 'h1':
        elements.push(
          <h1 key={`h1-${blockIndex}`} className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {formatInline(block.content)}
          </h1>
        );
        break;
      case 'h2':
        elements.push(
          <h2 key={`h2-${blockIndex}`} className="text-xl font-bold text-gray-900 mt-4 mb-2">
            {formatInline(block.content)}
          </h2>
        );
        break;
      case 'h3':
        elements.push(
          <h3 key={`h3-${blockIndex}`} className="text-lg font-semibold text-gray-900 mt-3 mb-2">
            {formatInline(block.content)}
          </h3>
        );
        break;
      case 'h4':
        elements.push(
          <h4 key={`h4-${blockIndex}`} className="text-base font-semibold text-gray-900 mt-2 mb-1">
            {formatInline(block.content)}
          </h4>
        );
        break;
      case 'ul':
        elements.push(
          <ul key={`ul-${blockIndex}`} className="my-2 space-y-1">
            {block.items?.map((item, itemIndex) => (
              <li key={`li-${blockIndex}-${itemIndex}`} className="flex items-start">
                <span className="mr-2 mt-0.5 text-blue-500 font-bold">•</span>
                <span className="text-gray-900 flex-1">{formatInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        break;
      case 'ol':
        elements.push(
          <ol key={`ol-${blockIndex}`} className="my-2 space-y-1">
            {block.items?.map((item, itemIndex) => (
              <li key={`li-${blockIndex}-${itemIndex}`} className="flex items-start">
                <span className="mr-2 text-gray-700 font-medium min-w-[1.5rem]">{itemIndex + 1}.</span>
                <span className="text-gray-900 flex-1">{formatInline(item)}</span>
              </li>
            ))}
          </ol>
        );
        break;
      case 'paragraph':
        elements.push(
          <p key={`p-${blockIndex}`} className="my-2 text-gray-900 leading-relaxed">
            {formatInline(block.content)}
          </p>
        );
        break;
      case 'linebreak':
        elements.push(<br key={`br-${blockIndex}`} />);
        break;
    }
  });
  
  return <div className="space-y-1">{elements}</div>;
}

interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'paragraph' | 'linebreak' | 'code';
  content: string;
  items?: string[];
  language?: string;
  code?: string;
}

/**
 * Detects and extracts a code block starting at the given index
 * @param lines - Array of text lines
 * @param startIndex - Index where the opening fence is located
 * @returns Object containing the code block (if found) and the index after the block
 */
function detectCodeBlock(lines: string[], startIndex: number): {
  block: MarkdownBlock | null;
  endIndex: number;
} {
  const openingLine = lines[startIndex].trim();
  
  // Check if this is a code fence opening (```)
  if (!openingLine.startsWith('```')) {
    return { block: null, endIndex: startIndex };
  }
  
  // Extract language identifier (everything after the opening ```)
  const language = openingLine.substring(3).trim() || 'text';
  
  // Collect code lines until we find the closing fence
  const codeLines: string[] = [];
  let i = startIndex + 1;
  let foundClosingFence = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check for closing fence (line that starts with ``` when trimmed)
    if (line.trim().startsWith('```')) {
      foundClosingFence = true;
      break;
    }
    
    // Add line to code content (preserve original formatting, don't trim)
    codeLines.push(line);
    i++;
  }
  
  // Join code lines with newlines
  const code = codeLines.join('\n');
  
  // Create the code block
  const block: MarkdownBlock = {
    type: 'code',
    content: '',
    language,
    code
  };
  
  // If we found a closing fence, endIndex is after it
  // If not (unclosed fence), endIndex is at the end of the array
  const endIndex = foundClosingFence ? i + 1 : lines.length;
  
  return { block, endIndex };
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = text.split('\n');
  const blocks: MarkdownBlock[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for code blocks FIRST (before other markdown elements)
    // This ensures code blocks are processed with highest priority
    if (trimmedLine.startsWith('```')) {
      // Close any open list before starting a code block
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      
      // Detect and extract the code block
      const { block, endIndex } = detectCodeBlock(lines, i);
      
      if (block) {
        blocks.push(block);
        // Move index to after the code block (endIndex - 1 because loop will increment)
        i = endIndex - 1;
        continue;
      }
    }
    
    // Empty line
    if (trimmedLine === '') {
      // Close any open list
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      blocks.push({ type: 'linebreak', content: '' });
      continue;
    }
    
    // Headers
    const h1Match = trimmedLine.match(/^#\s+(.+)$/);
    const h2Match = trimmedLine.match(/^##\s+(.+)$/);
    const h3Match = trimmedLine.match(/^###\s+(.+)$/);
    const h4Match = trimmedLine.match(/^####\s+(.+)$/);
    
    if (h4Match) {
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      blocks.push({ type: 'h4', content: h4Match[1] });
      continue;
    }
    
    if (h3Match) {
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      blocks.push({ type: 'h3', content: h3Match[1] });
      continue;
    }
    
    if (h2Match) {
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      blocks.push({ type: 'h2', content: h2Match[1] });
      continue;
    }
    
    if (h1Match) {
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      blocks.push({ type: 'h1', content: h1Match[1] });
      continue;
    }
    
    // Unordered list items (-, •, *)
    const ulMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) {
          blocks.push({ type: currentList.type, content: '', items: currentList.items });
        }
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }
    
    // Ordered list items (1., 2., etc.)
    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) {
          blocks.push({ type: currentList.type, content: '', items: currentList.items });
        }
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }
    
    // Regular paragraph
    if (currentList) {
      blocks.push({ type: currentList.type, content: '', items: currentList.items });
      currentList = null;
    }
    blocks.push({ type: 'paragraph', content: trimmedLine });
  }
  
  // Close any remaining list
  if (currentList) {
    blocks.push({ type: currentList.type, content: '', items: currentList.items });
  }
  
  return blocks;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  
  // Combined regex for bold, italic, markdown links, and plain URLs
  // Matches: **bold**, *italic*, [link text](url), and plain URLs
  // Updated URL pattern to match URLs more accurately (stop at whitespace or common punctuation)
  const combinedRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s<>]+)/g;
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
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text (*text*)
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic text-gray-900">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Markdown link [text](url)
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline transition-colors duration-150 break-all"
        >
          {match[6]}
        </a>
      );
    } else if (match[8]) {
      // Plain URL (http:// or https://)
      // Clean up trailing punctuation that's likely not part of the URL
      let url = match[8];
      let trailingPunctuation = '';
      
      // Remove common trailing punctuation
      const punctuationMatch = url.match(/^(.*?)([\.,;:!?\)]+)$/);
      if (punctuationMatch) {
        url = punctuationMatch[1];
        trailingPunctuation = punctuationMatch[2];
      }
      
      parts.push(
        <a
          key={`url-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline transition-colors duration-150 break-all"
        >
          {url}
        </a>
      );
      
      // Add back the trailing punctuation as plain text
      if (trailingPunctuation) {
        parts.push(
          <span key={`punct-${keyIndex++}`}>
            {trailingPunctuation}
          </span>
        );
      }
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
