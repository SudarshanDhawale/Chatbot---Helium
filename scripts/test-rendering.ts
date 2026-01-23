/**
 * Test to verify code block rendering integration
 * This script verifies that the renderMarkdown function properly handles code blocks
 */

console.log('=== Testing Code Block Rendering Integration ===\n');

// Test 1: Verify import path is correct
console.log('Test 1: Verify CodeBlock import');
try {
  const fs = require('fs');
  const path = require('path');
  const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
  const content = fs.readFileSync(markdownPath, 'utf-8');
  
  const hasImport = content.includes("import { CodeBlock } from '@/components/chat/CodeBlock'");
  console.log('✓ Expected: CodeBlock import present');
  console.log('✓ Actual:', hasImport ? 'PASS' : 'FAIL');
  console.log();
} catch (error) {
  console.log('✗ FAIL:', error);
  console.log();
}

// Test 2: Verify code case in switch statement
console.log('Test 2: Verify code case in renderMarkdown switch');
try {
  const fs = require('fs');
  const path = require('path');
  const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
  const content = fs.readFileSync(markdownPath, 'utf-8');
  
  const hasCodeCase = content.includes("case 'code':");
  const hasCodeBlockComponent = content.includes('<CodeBlock');
  const passesLanguage = content.includes('language={block.language');
  const passesCode = content.includes('code={block.code');
  
  console.log('  - Has code case:', hasCodeCase ? '✓' : '✗');
  console.log('  - Renders CodeBlock component:', hasCodeBlockComponent ? '✓' : '✗');
  console.log('  - Passes language prop:', passesLanguage ? '✓' : '✗');
  console.log('  - Passes code prop:', passesCode ? '✓' : '✗');
  
  const allPass = hasCodeCase && hasCodeBlockComponent && passesLanguage && passesCode;
  console.log('✓ Expected: All checks pass');
  console.log('✓ Actual:', allPass ? 'PASS' : 'FAIL');
  console.log();
} catch (error) {
  console.log('✗ FAIL:', error);
  console.log();
}

// Test 3: Verify code block detection is called in parseMarkdownBlocks
console.log('Test 3: Verify code block detection integration');
try {
  const fs = require('fs');
  const path = require('path');
  const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
  const content = fs.readFileSync(markdownPath, 'utf-8');
  
  const checksForBackticks = content.includes("trimmedLine.startsWith('```')");
  const callsDetectCodeBlock = content.includes('detectCodeBlock(lines, i)');
  const addsToBlocks = content.includes('blocks.push(block)');
  const updatesIndex = content.includes('i = endIndex - 1');
  
  console.log('  - Checks for triple backticks:', checksForBackticks ? '✓' : '✗');
  console.log('  - Calls detectCodeBlock:', callsDetectCodeBlock ? '✓' : '✗');
  console.log('  - Adds block to array:', addsToBlocks ? '✓' : '✗');
  console.log('  - Updates loop index:', updatesIndex ? '✓' : '✗');
  
  const allPass = checksForBackticks && callsDetectCodeBlock && addsToBlocks && updatesIndex;
  console.log('✓ Expected: All checks pass');
  console.log('✓ Actual:', allPass ? 'PASS' : 'FAIL');
  console.log();
} catch (error) {
  console.log('✗ FAIL:', error);
  console.log();
}

// Test 4: Verify code blocks are checked FIRST (before other elements)
console.log('Test 4: Verify code blocks have priority');
try {
  const fs = require('fs');
  const path = require('path');
  const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
  const content = fs.readFileSync(markdownPath, 'utf-8');
  
  // Find the position of code block check and header check
  const codeCheckPos = content.indexOf("trimmedLine.startsWith('```')");
  const headerCheckPos = content.indexOf("const h1Match = trimmedLine.match");
  
  const codeBeforeHeaders = codeCheckPos > 0 && headerCheckPos > 0 && codeCheckPos < headerCheckPos;
  
  console.log('  - Code block check position:', codeCheckPos);
  console.log('  - Header check position:', headerCheckPos);
  console.log('  - Code blocks checked before headers:', codeBeforeHeaders ? '✓' : '✗');
  
  console.log('✓ Expected: Code blocks processed before other elements');
  console.log('✓ Actual:', codeBeforeHeaders ? 'PASS' : 'FAIL');
  console.log();
} catch (error) {
  console.log('✗ FAIL:', error);
  console.log();
}

// Test 5: Verify list is closed before code block
console.log('Test 5: Verify list handling before code blocks');
try {
  const fs = require('fs');
  const path = require('path');
  const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
  const content = fs.readFileSync(markdownPath, 'utf-8');
  
  // Check that currentList is closed when code block is found
  const codeBlockSection = content.substring(
    content.indexOf("if (trimmedLine.startsWith('```'))"),
    content.indexOf("if (trimmedLine.startsWith('```'))") + 500
  );
  
  const closesCurrentList = codeBlockSection.includes('if (currentList)') && 
                            codeBlockSection.includes('blocks.push({ type: currentList.type');
  
  console.log('  - Closes current list before code block:', closesCurrentList ? '✓' : '✗');
  
  console.log('✓ Expected: Current list closed before code block');
  console.log('✓ Actual:', closesCurrentList ? 'PASS' : 'FAIL');
  console.log();
} catch (error) {
  console.log('✗ FAIL:', error);
  console.log();
}

console.log('=== Rendering Integration Tests Complete ===');