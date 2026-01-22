/**
 * Integration test for tab character rendering
 * This test verifies that tabs render consistently in code blocks
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlock } from '../src/components/chat/CodeBlock';

describe('Tab Character Handling', () => {
  it('should render code with tab characters', () => {
    const codeWithTabs = 'function test() {\n\tconsole.log("tab");\n}';
    
    render(<CodeBlock language="javascript" code={codeWithTabs} />);
    
    // The code should be rendered
    expect(screen.getByText(/console\.log/)).toBeInTheDocument();
  });

  it('should render code with multiple tab levels', () => {
    const codeWithMultipleTabs = 'function test() {\n\tif (true) {\n\t\tconsole.log("nested");\n\t}\n}';
    
    render(<CodeBlock language="javascript" code={codeWithMultipleTabs} />);
    
    // The code should be rendered with proper structure
    expect(screen.getByText(/nested/)).toBeInTheDocument();
  });

  it('should render code with mixed tabs and spaces', () => {
    const mixedCode = 'function test() {\n\tconsole.log("tab");\n    console.log("spaces");\n}';
    
    render(<CodeBlock language="javascript" code={mixedCode} />);
    
    // Both lines should be rendered
    expect(screen.getByText(/tab/)).toBeInTheDocument();
    expect(screen.getByText(/spaces/)).toBeInTheDocument();
  });

  it('should handle Python code with tabs', () => {
    const pythonCode = 'def test():\n\tprint("tab")\n\tif True:\n\t\tprint("nested")';
    
    render(<CodeBlock language="python" code={pythonCode} />);
    
    // Python code should be rendered
    expect(screen.getByText(/print/)).toBeInTheDocument();
  });

  it('should handle empty code with tabs gracefully', () => {
    const emptyWithTabs = '\t\t\t';
    
    render(<CodeBlock language="javascript" code={emptyWithTabs} />);
    
    // Should render without errors (tabs are whitespace)
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
  });

  it('should preserve tabs in copied code', async () => {
    const codeWithTabs = 'function test() {\n\tconsole.log("tab");\n}';
    
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    
    const { getByLabelText } = render(<CodeBlock language="javascript" code={codeWithTabs} />);
    
    const copyButton = getByLabelText('Copy code');
    await copyButton.click();
    
    // Verify that the raw code with tabs is copied
    expect(mockWriteText).toHaveBeenCalledWith(codeWithTabs);
  });

  it('should handle code with only tabs', () => {
    const onlyTabs = '\t\t\t\n\t\t\n\t';
    
    render(<CodeBlock language="text" code={onlyTabs} />);
    
    // Should render without errors
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
  });

  it('should handle very long lines with tabs', () => {
    const longLineWithTabs = '\tconst veryLongVariableName = "this is a very long string that exceeds the container width and should trigger horizontal scrolling";';
    
    render(<CodeBlock language="javascript" code={longLineWithTabs} />);
    
    // Should render without errors
    expect(screen.getByText(/veryLongVariableName/)).toBeInTheDocument();
  });
});
