/**
 * Manual test for tab character handling
 * This script verifies that the CodeBlock component is properly configured for tabs
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('='.repeat(60));
console.log('Tab Character Handling - Manual Test');
console.log('='.repeat(60));
console.log();

// Test samples
const testCases = [
  {
    name: 'JavaScript with tabs',
    language: 'javascript',
    code: 'function example() {\n\tconsole.log("This line has 1 tab");\n\t\tconsole.log("This line has 2 tabs");\n\t\t\tconsole.log("This line has 3 tabs");\n}',
  },
  {
    name: 'Mixed tabs and spaces',
    language: 'javascript',
    code: 'function mixed() {\n\tconsole.log("Tab indent");\n    console.log("4 spaces indent");\n\t    console.log("Tab + 4 spaces");\n        console.log("8 spaces indent");\n}',
  },
  {
    name: 'Python with tabs',
    language: 'python',
    code: 'def example():\n\tprint("This line has 1 tab")\n\tif True:\n\t\tprint("This line has 2 tabs")\n\t\tfor i in range(3):\n\t\t\tprint(f"This line has 3 tabs: {i}")',
  },
  {
    name: 'Tab alignment',
    language: 'javascript',
    code: 'const a\t= 1;\t// tab before =, tab before comment\nconst bb\t= 2;\t// tab before =, tab before comment\nconst ccc\t= 3;\t// tab before =, tab before comment',
  },
];

console.log('Test Cases:');
console.log('-'.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Language: ${testCase.language}`);
  console.log(`   Code preview (showing tab characters as [TAB]):`);
  
  const preview = testCase.code
    .split('\n')
    .slice(0, 5) // Show first 5 lines
    .map(line => '   ' + line.replace(/\t/g, '[TAB]'))
    .join('\n');
  
  console.log(preview);
  
  if (testCase.code.split('\n').length > 5) {
    console.log('   ...');
  }
});

console.log('\n' + '='.repeat(60));
console.log('Configuration Verification:');
console.log('='.repeat(60));

// Read the CodeBlock component
const codeBlockPath = join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
const codeBlockContent = readFileSync(codeBlockPath, 'utf-8');

// Check configurations
const checks = [
  {
    name: 'SyntaxHighlighter customStyle has tabSize: 4',
    test: () => codeBlockContent.includes('customStyle={{') && codeBlockContent.includes('tabSize: 4'),
  },
  {
    name: 'SyntaxHighlighter codeTagProps has tabSize: 4',
    test: () => codeBlockContent.includes('codeTagProps={{') && codeBlockContent.includes('tabSize: 4'),
  },
  {
    name: 'PlainCodeBlock pre element has tabSize: 4',
    test: () => codeBlockContent.match(/function PlainCodeBlock[\s\S]*?<pre[\s\S]*?tabSize:\s*4/) !== null,
  },
  {
    name: 'PlainCodeBlock code element has tabSize: 4',
    test: () => codeBlockContent.match(/function PlainCodeBlock[\s\S]*?<code[^>]*style={{[^}]*tabSize:\s*4/) !== null,
  },
  {
    name: 'whiteSpace: pre is maintained',
    test: () => codeBlockContent.includes("whiteSpace: 'pre'"),
  },
];

let allPassed = true;
checks.forEach(check => {
  const passed = check.test();
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
  if (!passed) allPassed = false;
});

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));

if (allPassed) {
  console.log('✓ All configuration checks passed!');
  console.log('\nTab characters are configured to render as 4 spaces consistently.');
  console.log('\nExpected behavior:');
  console.log('  - Each tab character will render as 4 character positions');
  console.log('  - Tabs will be consistent across all code blocks');
  console.log('  - Mixed tabs and spaces will align properly');
  console.log('  - Tab width applies to both syntax-highlighted and plain code');
  console.log('\nTo visually verify:');
  console.log('  1. Open scripts/test-tab-handling.html in a browser');
  console.log('  2. Check that indentation levels are visually consistent');
  console.log('  3. Verify that 1 tab = 4 character positions using the ruler');
} else {
  console.error('✗ Some configuration checks failed!');
  console.error('Please review the CodeBlock component implementation.');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
