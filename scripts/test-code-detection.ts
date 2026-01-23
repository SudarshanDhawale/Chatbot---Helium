/**
 * Simple verification script for code block detection
 */

// Inline the detectCodeBlock function for testing
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

// Test cases
console.log('=== Testing Code Block Detection ===\n');

// Test 1: Code block with language identifier
console.log('Test 1: Code block with language identifier');
const test1 = detectCodeBlock(['```python', 'def hello():', '    print("Hello")', '```'], 0);
console.log('Result:', test1);
console.log('✓ Expected: language=python, code with indentation, endIndex=4');
console.log('✓ Actual:', test1.block?.language === 'python' && test1.endIndex === 4 ? 'PASS' : 'FAIL');
console.log();

// Test 2: Code block without language (defaults to 'text')
console.log('Test 2: Code block without language identifier');
const test2 = detectCodeBlock(['```', 'some code', '```'], 0);
console.log('Result:', test2);
console.log('✓ Expected: language=text, endIndex=3');
console.log('✓ Actual:', test2.block?.language === 'text' && test2.endIndex === 3 ? 'PASS' : 'FAIL');
console.log();

// Test 3: Unclosed code fence (treat rest as code)
console.log('Test 3: Unclosed code fence');
const test3 = detectCodeBlock(['```javascript', 'const x = 1;', 'const y = 2;'], 0);
console.log('Result:', test3);
console.log('✓ Expected: language=javascript, endIndex=3 (end of array)');
console.log('✓ Actual:', test3.block?.language === 'javascript' && test3.endIndex === 3 ? 'PASS' : 'FAIL');
console.log();

// Test 4: Empty code block
console.log('Test 4: Empty code block');
const test4 = detectCodeBlock(['```typescript', '```'], 0);
console.log('Result:', test4);
console.log('✓ Expected: language=typescript, code="" (empty)');
console.log('✓ Actual:', test4.block?.language === 'typescript' && test4.block?.code === '' ? 'PASS' : 'FAIL');
console.log();

// Test 5: Code with special characters
console.log('Test 5: Code with special characters');
const test5 = detectCodeBlock(['```bash', 'echo "Hello $USER"', 'ls -la | grep "test"', '```'], 0);
console.log('Result:', test5);
console.log('✓ Expected: Special characters preserved');
console.log('✓ Actual:', test5.block?.code?.includes('$USER') && test5.block?.code?.includes('|') ? 'PASS' : 'FAIL');
console.log();

// Test 6: Not a code fence
console.log('Test 6: Not a code fence');
const test6 = detectCodeBlock(['Regular text', 'More text'], 0);
console.log('Result:', test6);
console.log('✓ Expected: block=null, endIndex=0');
console.log('✓ Actual:', test6.block === null && test6.endIndex === 0 ? 'PASS' : 'FAIL');
console.log();

console.log('=== All Tests Complete ===');
