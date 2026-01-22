/**
 * Checkpoint 4: Comprehensive test for basic code block parsing and rendering
 * This script verifies that all components are working together correctly
 */

console.log('=== CHECKPOINT 4: Basic Code Block Parsing and Rendering ===\n');

let allTestsPassed = true;

// Test 1: Code block detection
console.log('Test Suite 1: Code Block Detection');
console.log('-----------------------------------');
try {
  const { execSync } = require('child_process');
  const output = execSync('npx tsx scripts/test-code-detection.ts', { encoding: 'utf-8' });
  const passed = output.includes('PASS') && !output.includes('FAIL');
  console.log(passed ? '✓ PASSED' : '✗ FAILED');
  if (!passed) {
    console.log(output);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('✗ FAILED');
  console.log(error);
  allTestsPassed = false;
}
console.log();

// Test 2: Rendering integration
console.log('Test Suite 2: Rendering Integration');
console.log('-----------------------------------');
try {
  const { execSync } = require('child_process');
  const output = execSync('npx tsx scripts/test-rendering.ts', { encoding: 'utf-8' });
  const passed = output.includes('PASS') && !output.includes('FAIL');
  console.log(passed ? '✓ PASSED' : '✗ FAILED');
  if (!passed) {
    console.log(output);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('✗ FAILED');
  console.log(error);
  allTestsPassed = false;
}
console.log();

// Test 3: Integration tests
console.log('Test Suite 3: Integration Tests');
console.log('--------------------------------');
try {
  const { execSync } = require('child_process');
  const output = execSync('npx tsx scripts/test-integration.ts', { encoding: 'utf-8' });
  const passed = output.includes('PASS') && !output.includes('FAIL');
  console.log(passed ? '✓ PASSED' : '✗ FAILED');
  if (!passed) {
    console.log(output);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('✗ FAILED');
  console.log(error);
  allTestsPassed = false;
}
console.log();

// Test 4: File existence and structure
console.log('Test Suite 4: File Structure');
console.log('----------------------------');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/utils/markdown.tsx',
  'src/components/chat/CodeBlock.tsx',
];

let filesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    filesExist = false;
    allTestsPassed = false;
  }
}
console.log();

// Test 5: Implementation completeness
console.log('Test Suite 5: Implementation Completeness');
console.log('-----------------------------------------');

const markdownPath = path.join(process.cwd(), 'src/utils/markdown.tsx');
const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

const checks = [
  { name: 'MarkdownBlock includes code type', test: markdownContent.includes("| 'code'") },
  { name: 'MarkdownBlock has language property', test: markdownContent.includes('language?: string') },
  { name: 'MarkdownBlock has code property', test: markdownContent.includes('code?: string') },
  { name: 'detectCodeBlock function exists', test: markdownContent.includes('function detectCodeBlock') },
  { name: 'Code blocks checked before headers', test: markdownContent.indexOf("startsWith('```')") < markdownContent.indexOf('const h1Match') },
  { name: 'CodeBlock component imported', test: markdownContent.includes("import { CodeBlock }") },
  { name: 'Code case in switch statement', test: markdownContent.includes("case 'code':") },
  { name: 'CodeBlock rendered with props', test: markdownContent.includes('<CodeBlock') && markdownContent.includes('language={') && markdownContent.includes('code={') },
];

for (const check of checks) {
  if (check.test) {
    console.log(`✓ ${check.name}`);
  } else {
    console.log(`✗ ${check.name}`);
    allTestsPassed = false;
  }
}
console.log();

// Final summary
console.log('=== CHECKPOINT 4 SUMMARY ===');
console.log('============================');
if (allTestsPassed) {
  console.log('✓ ALL TESTS PASSED');
  console.log('\nBasic code block parsing and rendering is working correctly!');
  console.log('The following functionality has been verified:');
  console.log('  • Code block detection with language identifiers');
  console.log('  • Code block parsing without language (defaults to "text")');
  console.log('  • Unclosed code fence handling');
  console.log('  • Empty code block handling');
  console.log('  • Special character preservation');
  console.log('  • Multiple code blocks in one message');
  console.log('  • Code blocks mixed with other markdown elements');
  console.log('  • Code block priority (processed before other elements)');
  console.log('  • Integration with CodeBlock component');
  console.log('\nReady to proceed to the next tasks!');
} else {
  console.log('✗ SOME TESTS FAILED');
  console.log('\nPlease review the failures above and fix any issues.');
}
console.log();
