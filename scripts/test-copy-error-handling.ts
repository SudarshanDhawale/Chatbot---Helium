/**
 * Test script to verify copy error handling in CodeBlock component
 * Tests that copy failures maintain original button state and log errors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from '../src/components/chat/CodeBlock';

describe('Task 7.3: Copy Error Handling', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalClipboard: Clipboard;

  beforeEach(() => {
    // Spy on console.error to verify error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Save original clipboard
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
    
    // Restore clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('should maintain original button state when copy fails', async () => {
    // Mock clipboard to throw an error
    const mockClipboard = {
      writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    const testCode = 'console.log("test");';
    render(<CodeBlock language="javascript" code={testCode} />);

    // Find and click the copy button
    const copyButton = screen.getByLabelText('Copy code');
    expect(copyButton).toHaveTextContent('Copy');

    await userEvent.click(copyButton);

    // Wait a bit to ensure async operation completes
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(testCode);
    });

    // Button should still show "Copy" (not "Copied")
    expect(copyButton).toHaveTextContent('Copy');
    expect(copyButton).not.toHaveTextContent('Copied');
  });

  it('should log error to console when copy fails', async () => {
    // Mock clipboard to throw an error
    const testError = new Error('Clipboard access denied');
    const mockClipboard = {
      writeText: vi.fn().mockRejectedValue(testError),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    const testCode = 'print("hello")';
    render(<CodeBlock language="python" code={testCode} />);

    const copyButton = screen.getByLabelText('Copy code');
    await userEvent.click(copyButton);

    // Wait for async operation
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to copy code to clipboard:',
      testError
    );
  });

  it('should handle clipboard API not available', async () => {
    // Remove clipboard API entirely
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const testCode = 'SELECT * FROM users;';
    render(<CodeBlock language="sql" code={testCode} />);

    const copyButton = screen.getByLabelText('Copy code');
    await userEvent.click(copyButton);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Button should still show "Copy" (not "Copied")
    expect(copyButton).toHaveTextContent('Copy');
    expect(copyButton).not.toHaveTextContent('Copied');

    // Error should be logged
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should show success state when copy succeeds', async () => {
    // Mock successful clipboard
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    const testCode = 'echo "test"';
    render(<CodeBlock language="bash" code={testCode} />);

    const copyButton = screen.getByLabelText('Copy code');
    expect(copyButton).toHaveTextContent('Copy');

    await userEvent.click(copyButton);

    // Wait for state update
    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied');
    });

    // Verify clipboard was called correctly
    expect(mockClipboard.writeText).toHaveBeenCalledWith(testCode);

    // No error should be logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should reset to original state after timeout on success', async () => {
    // Mock successful clipboard
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    const testCode = '{ "test": true }';
    render(<CodeBlock language="json" code={testCode} />);

    const copyButton = screen.getByLabelText('Copy code');
    await userEvent.click(copyButton);

    // Should show "Copied"
    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied');
    });

    // Wait for timeout (2 seconds)
    await waitFor(
      () => {
        expect(copyButton).toHaveTextContent('Copy');
      },
      { timeout: 2500 }
    );
  });
});
