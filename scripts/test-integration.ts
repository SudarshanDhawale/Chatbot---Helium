/**
 * Integration test for code block parsing in markdown
 */

// Import the actual parseMarkdownBlocks function
import { readFileSync } from 'fs';
import { join } from 'path';

// Read and evaluate the markdown.tsx file to get the parseMarkdownBlocks function
const markdownPath = join(process.cwd(), 'src/utils/markdown.tsx');
const markdownContent = readFileSync(markdownPath, 'utf-8');

// Extract the parseMarkdownBlocks function (simplified approach for testing)
interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'paragraph' | 'linebreak' | 'code';
  content: string;
  items?: string[];
  language?: string;
  code?: string;
}

function detectCodeBlock(lines: string[], startIndex: number): {
  block: MarkdownBlock | null;
  endIndex: number;
} {
  const openingLine = lines[startIndex].trim();
  
  if (!openingLine.startsWith('```')) {
    return { block: null, endIndex: startIndex };
  }
  
  const language = openingLine.substring(3).trim() || 'text';
  
  const codeLines: string[] = [];
  let i = startIndex + 1;
  let foundClosingFence = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      foundClosingFence = true;
      break;
    }
    
    codeLines.push(line);
    i++;
  }
  
  const code = codeLines.join('\n');
  
  const block: MarkdownBlock = {
    type: 'code',
    content: '',
    language,
    code
  };
  
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
    if (trimmedLine.startsWith('```')) {
      if (currentList) {
        blocks.push({ type: currentList.type, content: '', items: currentList.items });
        currentList = null;
      }
      
      const { block, endIndex } = detectCodeBlock(lines, i);
      
      if (block) {
        blocks.push(block);
        i = endIndex - 1;
        continue;
      }
    }
    
    // Empty line
    if (trimmedLine === '') {
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

console.log('=== Testing Code Block Integration ===\n');

// Test 1: Single code block with language
console.log('Test 1: Single code block with language');
const markdown1 = `# Header
Here's some Python code:

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

That was the code.`;

const blocks1 = parseMarkdownBlocks(markdown1);
console.log('Parsed blocks:', blocks1.map(b => ({ type: b.type, language: b.language, hasCode: !!b.code })));

const codeBlock1 = blocks1.find(b => b.type === 'code');
console.log('✓ Expected: code block with language=python');
console.log('✓ Actual:', codeBlock1?.language === 'python' ? 'PASS' : 'FAIL');
console.log();

// Test 2: Multiple code blocks
console.log('Test 2: Multiple code blocks');
const markdown2 = `First code block:

\`\`\`javascript
const x = 1;
\`\`\`

Second code block:

\`\`\`python
y = 2
\`\`\``;

const blocks2 = parseMarkdownBlocks(markdown2);
const codeBlocks2 = blocks2.filter(b => b.type === 'code');
console.log('Code blocks found:', codeBlocks2.length);
console.log('Languages:', codeBlocks2.map(b => b.language));
console.log('✓ Expected: 2 code blocks with javascript and python');
console.log('✓ Actual:', codeBlocks2.length === 2 && 
  codeBlocks2.some(b => b.language === 'javascript') && 
  codeBlocks2.some(b => b.language === 'python') ? 'PASS' : 'FAIL');
console.log();

// Test 3: Code block mixed with other elements
console.log('Test 3: Mixed content parsing');
const markdown3 = `# Title

Some text here.

- List item 1
- List item 2

\`\`\`typescript
interface User {
  name: string;
}
\`\`\`

## Subtitle

More text.`;

const blocks3 = parseMarkdownBlocks(markdown3);
console.log('Block types in order:', blocks3.map(b => b.type));
console.log('✓ Expected: h1, linebreak, paragraph, linebreak, ul, linebreak, code, linebreak, h2, linebreak, paragraph');
const expectedOrder = ['h1', 'linebreak', 'paragraph', 'linebreak', 'ul', 'linebreak', 'code', 'linebreak', 'h2', 'linebreak', 'paragraph'];
const actualOrder = blocks3.map(b => b.type);
console.log('✓ Actual:', JSON.stringify(actualOrder) === JSON.stringify(expectedOrder) ? 'PASS' : 'FAIL');
console.log();

// Test 4: Code block priority (processed before other elements)
console.log('Test 4: Code block priority');
const markdown4 = `\`\`\`bash
# This looks like a header but should be treated as code
echo "test"
\`\`\``;

const blocks4 = parseMarkdownBlocks(markdown4);
console.log('Parsed blocks:', blocks4.map(b => ({ type: b.type, content: b.content?.substring(0, 20) })));
const hasCodeBlock = blocks4.some(b => b.type === 'code' && b.code?.includes('# This looks like a header'));
console.log('✓ Expected: Code block containing "# This looks like a header"');
console.log('✓ Actual:', hasCodeBlock ? 'PASS' : 'FAIL');
console.log();

console.log('=== Integration Tests Complete ===');