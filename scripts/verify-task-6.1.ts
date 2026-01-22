/**
 * Verification script for Task 6.1: Add ScrollableCodeContainer wrapper
 * 
 * This script verifies that:
 * 1. The CodeBlock component has a scrollable container wrapper
 * 2. The container has maxHeight set to 500px
 * 3. The container has overflow-x: auto for horizontal scroll
 * 4. The container has overflow-y: auto for vertical scroll
 * 5. The container has custom scrollbar styling for dark theme
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const codeBlockPath = join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
const codeBlockContent = readFileSync(codeBlockPath, 'utf-8');

console.log('🔍 Verifying Task 6.1: ScrollableCodeContainer wrapper...\n');

let allChecksPassed = true;

// Check 1: Verify overflow-x: auto is present
if (codeBlockContent.includes('overflow-x-auto')) {
  console.log('✅ Check 1: overflow-x-auto class is present');
} else {
  console.log('❌ Check 1: overflow-x-auto class is missing');
  allChecksPassed = false;
}

// Check 2: Verify overflow-y: auto is present
if (codeBlockContent.includes('overflow-y-auto')) {
  console.log('✅ Check 2: overflow-y-auto class is present');
} else {
  console.log('❌ Check 2: overflow-y-auto class is missing');
  allChecksPassed = false;
}

// Check 3: Verify maxHeight is set to 500px
if (codeBlockContent.includes("maxHeight: '500px'")) {
  console.log('✅ Check 3: maxHeight is set to 500px');
} else {
  console.log('❌ Check 3: maxHeight is not set to 500px');
  allChecksPassed = false;
}

// Check 4: Verify scrollbarWidth is set
if (codeBlockContent.includes("scrollbarWidth: 'thin'")) {
  console.log('✅ Check 4: scrollbarWidth is set to thin');
} else {
  console.log('❌ Check 4: scrollbarWidth is not set');
  allChecksPassed = false;
}

// Check 5: Verify scrollbarColor is set for dark theme
if (codeBlockContent.includes("scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2)'")) {
  console.log('✅ Check 5: scrollbarColor is set for dark theme');
} else {
  console.log('❌ Check 5: scrollbarColor is not set correctly');
  allChecksPassed = false;
}

// Check 6: Verify the wrapper div contains SafeSyntaxHighlighter
const wrapperPattern = /<div[^>]*overflow-x-auto[^>]*>[\s\S]*?<SafeSyntaxHighlighter/;
if (wrapperPattern.test(codeBlockContent)) {
  console.log('✅ Check 6: Wrapper div contains SafeSyntaxHighlighter');
} else {
  console.log('❌ Check 6: Wrapper div does not properly contain SafeSyntaxHighlighter');
  allChecksPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('✅ All checks passed! Task 6.1 is complete.');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the implementation.');
  process.exit(1);
}
