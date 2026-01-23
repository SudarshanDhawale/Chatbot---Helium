/**
 * Test: Verify user messages bypass markdown processing
 * Task 9.1 - Requirements 7.5
 * 
 * This test verifies that:
 * 1. ChatMessage component only calls renderMarkdown for assistant messages
 * 2. User messages with code fences display as plain text
 * 3. User messages don't trigger code block rendering
 */

import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

describe('ChatMessage - User Message Markdown Bypass', () => {
  const baseMessage: ChatMessageType = {
    id: 'test-message-1',
    role: 'user',
    content: '',
    timestamp: new Date().toISOString(),
    status: 'completed',
  };

  describe('User messages with code fences', () => {
    it('should display code fence syntax as plain text for user messages', () => {
      const messageWithCodeFence: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '```python\nprint("Hello, World!")\n```',
      };

      const { container } = render(<ChatMessage message={messageWithCodeFence} />);
      
      // User message should NOT render a CodeBlock component
      const codeBlock = container.querySelector('[class*="code-block"]');
      expect(codeBlock).toBeNull();
      
      // The raw text should be visible including the backticks
      expect(container.textContent).toContain('```python');
      expect(container.textContent).toContain('print("Hello, World!")');
      expect(container.textContent).toContain('```');
    });

    it('should preserve multiple code fences as plain text in user messages', () => {
      const messageWithMultipleCodeFences: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '```javascript\nconst x = 1;\n```\n\nSome text\n\n```python\nprint("test")\n```',
      };

      const { container } = render(<ChatMessage message={messageWithMultipleCodeFences} />);
      
      // Should not render any CodeBlock components
      const codeBlocks = container.querySelectorAll('[class*="code-block"]');
      expect(codeBlocks.length).toBe(0);
      
      // All raw text should be visible
      expect(container.textContent).toContain('```javascript');
      expect(container.textContent).toContain('const x = 1;');
      expect(container.textContent).toContain('```python');
      expect(container.textContent).toContain('print("test")');
    });

    it('should preserve whitespace and formatting in user messages', () => {
      const messageWithFormatting: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '```typescript\n  function test() {\n    return true;\n  }\n```',
      };

      const { container } = render(<ChatMessage message={messageWithFormatting} />);
      
      // Check that whitespace-pre-wrap is applied (preserves whitespace)
      const contentDiv = container.querySelector('.whitespace-pre-wrap');
      expect(contentDiv).toBeTruthy();
      
      // Raw content should be preserved
      expect(container.textContent).toContain('```typescript');
      expect(container.textContent).toContain('function test()');
    });
  });

  describe('Assistant messages with code fences', () => {
    it('should render code blocks for assistant messages', () => {
      const assistantMessage: ChatMessageType = {
        ...baseMessage,
        role: 'assistant',
        content: '```python\nprint("Hello, World!")\n```',
      };

      const { container } = render(<ChatMessage message={assistantMessage} />);
      
      // Assistant message SHOULD render markdown (which includes code blocks)
      // The renderMarkdown function should process the code fence
      // We can verify by checking that the raw backticks are NOT visible
      const textContent = container.textContent || '';
      
      // The content should be processed by renderMarkdown
      // Note: We're not checking for CodeBlock component here since that's tested elsewhere
      // We're just verifying that renderMarkdown is called (which processes the content)
      expect(textContent).not.toContain('```python');
    });
  });

  describe('User vs Assistant message handling', () => {
    it('should use different rendering logic for user vs assistant messages', () => {
      const userMessage: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '# Header\n\n```python\ncode\n```',
      };

      const assistantMessage: ChatMessageType = {
        ...baseMessage,
        id: 'test-message-2',
        role: 'assistant',
        content: '# Header\n\n```python\ncode\n```',
      };

      const { container: userContainer } = render(<ChatMessage message={userMessage} />);
      const { container: assistantContainer } = render(<ChatMessage message={assistantMessage} />);
      
      // User message should show raw markdown
      expect(userContainer.textContent).toContain('# Header');
      expect(userContainer.textContent).toContain('```python');
      
      // Assistant message should process markdown (no raw # or ```)
      const assistantText = assistantContainer.textContent || '';
      expect(assistantText).not.toContain('# Header');
      expect(assistantText).not.toContain('```python');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty user messages', () => {
      const emptyMessage: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '',
      };

      const { container } = render(<ChatMessage message={emptyMessage} />);
      
      // Should render without errors
      expect(container).toBeTruthy();
    });

    it('should handle user messages with only code fences', () => {
      const onlyCodeFence: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '```\n```',
      };

      const { container } = render(<ChatMessage message={onlyCodeFence} />);
      
      // Should display as plain text
      expect(container.textContent).toContain('```');
    });

    it('should handle unclosed code fences in user messages', () => {
      const unclosedCodeFence: ChatMessageType = {
        ...baseMessage,
        role: 'user',
        content: '```python\nprint("test")',
      };

      const { container } = render(<ChatMessage message={unclosedCodeFence} />);
      
      // Should display as plain text without errors
      expect(container.textContent).toContain('```python');
      expect(container.textContent).toContain('print("test")');
    });
  });
});
