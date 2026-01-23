/**
 * Integration test for Task 6.2: Configure SyntaxHighlighter for scroll preservation
 * 
 * This test verifies that the SyntaxHighlighter component is configured correctly
 * to preserve scroll behavior with wrapLongLines={false}.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing Task 6.2: SyntaxHighlighter scroll preservation configuration\n');

const codeBlockPath = join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
const codeBlockContent = readFileSync(codeBlockPath, 'utf-8');

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ ${name}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) {
      console.log(`   ${details}`);
    }
    testsFailed++;
  }
}

// Test 1: Verify wrapLongLines={false} is present
test(
  'Test 1: wrapLongLines={false} is configured',
  codeBlockContent.includes('wrapLongLines={false}'),
  'wrapLongLines={false} should be set on SyntaxHighlighter component'
);

// Test 2: Verify PreTag is configured
const hasPreTag = codeBlockContent.includes('PreTag=');
test(
  'Test 2: PreTag is configured',
  hasPreTag,
  'PreTag should be set to control the container element'
);

// Test 3: Verify the configuration is within SyntaxHighlighter component
const syntaxHighlighterBlock = codeBlockContent.match(
  /<SyntaxHighlighter[\s\S]*?<\/SyntaxHighlighter>/
);
if (syntaxHighlighterBlock) {
  const hasWrapLongLines = syntaxHighlighterBlock[0].includes('wrapLongLines={false}');
  test(
    'Test 3: wrapLongLines is within SyntaxHighlighter component',
    hasWrapLongLines,
    'wrapLongLines should be a prop of SyntaxHighlighter'
  );
} else {
  test(
    'Test 3: wrapLongLines is within SyntaxHighlighter component',
    false,
    'Could not find SyntaxHighlighter component block'
  );
}

// Test 4: Verify scrollable container is still present
const hasScrollContainer = 
  codeBlockContent.includes('overflow-x-auto') && 
  codeBlockContent.includes('overflow-y-auto');
test(
  'Test 4: Scrollable container is still configured',
  hasScrollContainer,
  'Container should have overflow-x-auto and overflow-y-auto'
);

// Test 5: Verify maxHeight is still set
test(
  'Test 5: maxHeight is still configured',
  codeBlockContent.includes("maxHeight: '500px'"),
  'Container should have maxHeight: 500px'
);

// Test 6: Verify customStyle is present for whitespace control
test(
  'Test 6: customStyle is present',
  codeBlockContent.includes('customStyle={{'),
  'customStyle should be present to control styling'
);

// Test 7: Verify the component structure is correct
const hasCorrectStructure = 
  codeBlockContent.includes('SafeSyntaxHighlighter') &&
  codeBlockContent.includes('PlainCodeBlock');
test(
  'Test 7: Component structure is intact',
  hasCorrectStructure,
  'SafeSyntaxHighlighter and PlainCodeBlock should be present'
);

// Test 8: Verify error handling is still in place
const hasErrorHandling = 
  codeBlockContent.includes('try {') &&
  codeBlockContent.includes('catch (error)');
test(
  'Test 8: Error handling is present',
  hasErrorHandling,
  'Try-catch block should be present for error handling'
);

console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n✅ All tests passed! Task 6.2 is complete.\n');
  console.log('Configuration Summary:');
  console.log('━'.repeat(60));
  console.log('✓ wrapLongLines={false}  - Prevents line wrapping');
  console.log('✓ PreTag configured      - Controls container element');
  console.log('✓ overflow-x: auto       - Enables horizontal scroll');
  console.log('✓ overflow-y: auto       - Enables vertical scroll');
  console.log('✓ maxHeight: 500px       - Limits vertical height');
  console.log('✓ customStyle            - Controls whitespace and styling');
  console.log('━'.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Test in the browser with long code lines');
  console.log('2. Verify horizontal scroll appears for long lines');
  console.log('3. Verify vertical scroll appears for tall code blocks');
  console.log('4. Verify whitespace and indentation are preserved');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please review the implementation.\n');
  process.exit(1);
}
