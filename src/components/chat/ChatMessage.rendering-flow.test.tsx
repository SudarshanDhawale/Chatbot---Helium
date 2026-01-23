/**
 * Test: Complete message rendering flow with code blocks
 * Task 10.1 - Requirements 7.1, 7.2
 * 
 * This test verifies end-to-end rendering of messages with code blocks:
 * 1. Messages with single code blocks render correctly
 * 2. Messages with multiple code blocks render independently
 * 3. Messages with code blocks mixed with other markdown render in correct order
 * 4. Code blocks preserve language and content
 */

import React from 'react';
import { renderMarkdown } from '@/utils/markdown';

/**
 * Test helper: Extract code blocks from rendered output
 */
function extractCodeBlocks(rendered: React.ReactNode): Array<{ language: string; code: string }> {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  
  function traverse(node: React.ReactNode): void {
    if (!node) return;
    
    if (React.isValidElement(node)) {
      // Check if this is a CodeBlock component
      if (node.type && typeof node.type === 'function' && node.type.name === 'CodeBlock') {
        const props = node.props as { language: string; code: string };
        codeBlocks.push({
          language: props.language,
          code: props.code
        });
      }
      
      // Traverse children
      const props = node.props as any;
      if (props && props.children) {
        React.Children.forEach(props.children, traverse);
      }
    } else if (Array.isArray(node)) {
      node.forEach(traverse);
    }
  }
  
  traverse(rendered);
  return codeBlocks;
}

/**
 * Test helper: Extract all block types from rendered output
 */
function extractBlocks(rendered: React.ReactNode): Array<{ type: string; content?: string }> {
  const blocks: Array<{ type: string; content?: string }> = [];
  
  function traverse(node: React.ReactNode): void {
    if (!node) return;
    
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement;
      
      // Identify block types by element type
      if (typeof element.type === 'string') {
        if (element.type === 'h1') blocks.push({ type: 'h1' });
        else if (element.type === 'h2') blocks.push({ type: 'h2' });
        else if (element.type === 'h3') blocks.push({ type: 'h3' });
        else if (element.type === 'h4') blocks.push({ type: 'h4' });
        else if (element.type === 'ul') blocks.push({ type: 'ul' });
        else if (element.type === 'ol') blocks.push({ type: 'ol' });
        else if (element.type === 'p') blocks.push({ type: 'p' });
      } else if (typeof element.type === 'function' && element.type.name === 'CodeBlock') {
        blocks.push({ type: 'code' });
      }
      
      // Traverse children
      const props = element.props as any;
      if (props && props.children) {
        React.Children.forEach(props.children, traverse);
      }
    } else if (Array.isArray(node)) {
      node.forEach(traverse);
    }
  }
  
  traverse(rendered);
  return blocks;
}

/**
 * Test Suite: Complete Message Rendering Flow
 */
describe('ChatMessage - Complete Rendering Flow', () => {
  
  describe('Single code block rendering', () => {
    it('should render a message with a single code block', () => {
      const content = '```python\nprint("Hello, World!")\n```';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have exactly one code block
      expect(codeBlocks.length).toBe(1);
      
      // Should preserve language
      expect(codeBlocks[0].language).toBe('python');
      
      // Should preserve code content
      expect(codeBlocks[0].code).toBe('print("Hello, World!")');
    });
    
    it('should render code block with no language identifier', () => {
      const content = '```\nconst x = 1;\n```';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have one code block
      expect(codeBlocks.length).toBe(1);
      
      // Should default to "text"
      expect(codeBlocks[0].language).toBe('text');
      
      // Should preserve code
      expect(codeBlocks[0].code).toBe('const x = 1;');
    });
    
    it('should render code block with various languages', () => {
      const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql'];
      
      languages.forEach(lang => {
        const content = `\`\`\`${lang}\ncode content\n\`\`\``;
        const rendered = renderMarkdown(content);
        const codeBlocks = extractCodeBlocks(rendered);
        
        expect(codeBlocks.length).toBe(1);
        expect(codeBlocks[0].language).toBe(lang);
        expect(codeBlocks[0].code).toBe('code content');
      });
    });
  });
  
  describe('Multiple code blocks rendering', () => {
    it('should render multiple code blocks independently', () => {
      const content = `\`\`\`python
print("First block")
\`\`\`

\`\`\`javascript
console.log("Second block");
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have two code blocks
      expect(codeBlocks.length).toBe(2);
      
      // First block
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[0].code).toBe('print("First block")');
      
      // Second block
      expect(codeBlocks[1].language).toBe('javascript');
      expect(codeBlocks[1].code).toBe('console.log("Second block");');
    });
    
    it('should render three or more code blocks', () => {
      const content = `\`\`\`python
block1
\`\`\`

\`\`\`javascript
block2
\`\`\`

\`\`\`typescript
block3
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(3);
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[1].language).toBe('javascript');
      expect(codeBlocks[2].language).toBe('typescript');
    });
    
    it('should handle consecutive code blocks without text between them', () => {
      const content = `\`\`\`python
first
\`\`\`
\`\`\`javascript
second
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(2);
      expect(codeBlocks[0].code).toBe('first');
      expect(codeBlocks[1].code).toBe('second');
    });
  });
  
  describe('Mixed content rendering', () => {
    it('should render code blocks mixed with headers', () => {
      const content = `# Main Title

\`\`\`python
print("code")
\`\`\`

## Subtitle

\`\`\`javascript
console.log("more code");
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const blocks = extractBlocks(rendered);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have headers and code blocks
      expect(blocks.filter(b => b.type === 'h1').length).toBe(1);
      expect(blocks.filter(b => b.type === 'h2').length).toBe(1);
      expect(blocks.filter(b => b.type === 'code').length).toBe(2);
      
      // Code blocks should be preserved
      expect(codeBlocks.length).toBe(2);
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[1].language).toBe('javascript');
    });
    
    it('should render code blocks mixed with lists', () => {
      const content = `Here are the steps:

- Step 1
- Step 2

\`\`\`python
# Implementation
def example():
    pass
\`\`\`

- Step 3
- Step 4`;
      
      const rendered = renderMarkdown(content);
      const blocks = extractBlocks(rendered);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have lists and code block
      expect(blocks.filter(b => b.type === 'ul').length).toBeGreaterThan(0);
      expect(blocks.filter(b => b.type === 'code').length).toBe(1);
      
      // Code block should be preserved
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[0].code).toContain('def example():');
    });
    
    it('should render code blocks mixed with paragraphs', () => {
      const content = `This is an introduction paragraph.

\`\`\`typescript
const x: number = 42;
\`\`\`

This is a middle paragraph.

\`\`\`javascript
const y = 100;
\`\`\`

This is a conclusion paragraph.`;
      
      const rendered = renderMarkdown(content);
      const blocks = extractBlocks(rendered);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should have paragraphs and code blocks
      expect(blocks.filter(b => b.type === 'p').length).toBeGreaterThan(0);
      expect(blocks.filter(b => b.type === 'code').length).toBe(2);
      
      // Code blocks should be preserved
      expect(codeBlocks.length).toBe(2);
      expect(codeBlocks[0].language).toBe('typescript');
      expect(codeBlocks[1].language).toBe('javascript');
    });
    
    it('should maintain correct order of mixed elements', () => {
      const content = `# Title

Paragraph text.

\`\`\`python
code1
\`\`\`

- List item 1
- List item 2

\`\`\`javascript
code2
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const blocks = extractBlocks(rendered);
      
      // Verify order: h1, p, code, ul, code
      const types = blocks.map(b => b.type);
      
      // Should have h1 before first code
      const h1Index = types.indexOf('h1');
      const firstCodeIndex = types.indexOf('code');
      expect(h1Index).toBeLessThan(firstCodeIndex);
      
      // Should have ul between the two code blocks
      const ulIndex = types.indexOf('ul');
      const lastCodeIndex = types.lastIndexOf('code');
      expect(ulIndex).toBeGreaterThan(firstCodeIndex);
      expect(ulIndex).toBeLessThan(lastCodeIndex);
    });
  });
  
  describe('Code content preservation', () => {
    it('should preserve multi-line code', () => {
      const content = `\`\`\`python
def hello():
    print("Hello")
    print("World")
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toBe('def hello():\n    print("Hello")\n    print("World")');
    });
    
    it('should preserve indentation in code', () => {
      const content = `\`\`\`javascript
function test() {
  if (true) {
    console.log("nested");
  }
}
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toContain('  if (true)');
      expect(codeBlocks[0].code).toContain('    console.log("nested")');
    });
    
    it('should preserve empty lines in code', () => {
      const content = `\`\`\`python
def func1():
    pass

def func2():
    pass
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toContain('\n\n');
    });
    
    it('should preserve special characters in code', () => {
      const content = `\`\`\`javascript
const str = "Hello <>&'\\"\\"";
const regex = /[a-z]+/g;
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toContain('<>&');
      expect(codeBlocks[0].code).toContain('/[a-z]+/g');
    });
  });
  
  describe('Edge cases', () => {
    it('should handle empty code blocks', () => {
      const content = '```python\n```';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[0].code).toBe('');
    });
    
    it('should handle code blocks with only whitespace', () => {
      const content = '```javascript\n   \n\n   \n```';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toContain('   ');
    });
    
    it('should handle unclosed code blocks', () => {
      const content = '```python\nprint("test")';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      // Should still create a code block (treating rest of content as code)
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].language).toBe('python');
      expect(codeBlocks[0].code).toBe('print("test")');
    });
    
    it('should handle code blocks with backticks in content', () => {
      const content = '```markdown\nUse `inline code` like this\n```';
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      
      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].code).toContain('`inline code`');
    });
  });
  
  describe('Real-world scenarios', () => {
    it('should render a typical assistant response with explanation and code', () => {
      const content = `Here's how to implement the function:

\`\`\`typescript
function calculateSum(a: number, b: number): number {
  return a + b;
}
\`\`\`

You can use it like this:

\`\`\`typescript
const result = calculateSum(5, 10);
console.log(result); // 15
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      const blocks = extractBlocks(rendered);
      
      // Should have 2 code blocks
      expect(codeBlocks.length).toBe(2);
      
      // Both should be TypeScript
      expect(codeBlocks[0].language).toBe('typescript');
      expect(codeBlocks[1].language).toBe('typescript');
      
      // Should have paragraphs between code blocks
      expect(blocks.filter(b => b.type === 'p').length).toBeGreaterThan(0);
    });
    
    it('should render a tutorial-style message with multiple sections', () => {
      const content = `# Tutorial: Getting Started

## Step 1: Installation

First, install the package:

\`\`\`bash
npm install example-package
\`\`\`

## Step 2: Configuration

Create a config file:

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0"
}
\`\`\`

## Step 3: Usage

Import and use it:

\`\`\`javascript
import { example } from 'example-package';
example();
\`\`\``;
      
      const rendered = renderMarkdown(content);
      const codeBlocks = extractCodeBlocks(rendered);
      const blocks = extractBlocks(rendered);
      
      // Should have 3 code blocks
      expect(codeBlocks.length).toBe(3);
      
      // Should have different languages
      expect(codeBlocks[0].language).toBe('bash');
      expect(codeBlocks[1].language).toBe('json');
      expect(codeBlocks[2].language).toBe('javascript');
      
      // Should have headers
      expect(blocks.filter(b => b.type === 'h1').length).toBe(1);
      expect(blocks.filter(b => b.type === 'h2').length).toBe(3);
    });
  });
});

/**
 * Simple test runner
 */
function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toContain(expected: any) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
      }
    }
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error instanceof Error ? error.message : String(error)}`);
  }
}
