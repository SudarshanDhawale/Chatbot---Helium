/**
 * Verification script for tab character handling
 * Tests that tabs are configured consistently in the CodeBlock component
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, condition: boolean, message: string) {
  results.push({ name, passed: condition, message });
  if (condition) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}: ${message}`);
  }
}

// Read the CodeBlock component
const codeBlockPath = join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
const codeBlockContent = readFileSync(codeBlockPath, 'utf-8');

// Test 1: Check that tabSize is set in customStyle
test(
  'SyntaxHighlighter has tabSize in customStyle',
  codeBlockContent.includes('tabSize: 4') && 
  codeBlockContent.includes('customStyle={{'),
  'tabSize: 4 should be present in customStyle'
);

// Test 2: Check that tabSize is set in codeTagProps
test(
  'SyntaxHighlighter has tabSize in codeTagProps',
  codeBlockContent.includes('codeTagProps={{') &&
  codeBlockContent.includes('tabSize: 4'),
  'tabSize: 4 should be present in codeTagProps style'
);

// Test 3: Check that PlainCodeBlock fallback has tabSize
test(
  'PlainCodeBlock has tabSize in pre element',
  codeBlockContent.includes('function PlainCodeBlock') &&
  codeBlockContent.match(/function PlainCodeBlock[\s\S]*?tabSize:\s*4/),
  'PlainCodeBlock should have tabSize: 4 in pre element style'
);

// Test 4: Check that PlainCodeBlock code element has tabSize
test(
  'PlainCodeBlock has tabSize in code element',
  codeBlockContent.includes('function PlainCodeBlock') &&
  codeBlockContent.match(/function PlainCodeBlock[\s\S]*?<code[^>]*style={{[^}]*tabSize:\s*4/),
  'PlainCodeBlock code element should have tabSize: 4'
);

// Test 5: Verify consistent tab size value (all should be 4)
const tabSizeMatches = codeBlockContent.match(/tabSize:\s*(\d+)/g) || [];
const allTabSizesAre4 = tabSizeMatches.every(match => match.includes('4'));
test(
  'All tabSize values are consistently set to 4',
  tabSizeMatches.length >= 3 && allTabSizesAre4,
  `Found ${tabSizeMatches.length} tabSize declarations, all should be 4`
);

// Test 6: Check that whiteSpace: 'pre' is maintained (required for tabs to work)
test(
  'SyntaxHighlighter maintains whiteSpace: pre',
  codeBlockContent.includes("whiteSpace: 'pre'"),
  'whiteSpace: pre is required for tab characters to render correctly'
);

// Summary
console.log('\n' + '='.repeat(50));
const passed = results.filter(r => r.passed).length;
const total = results.length;
console.log(`Results: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log('✓ All tab handling tests passed!');
  console.log('\nTab characters are configured to render as 4 spaces consistently.');
  process.exit(0);
} else {
  console.error('\n✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
