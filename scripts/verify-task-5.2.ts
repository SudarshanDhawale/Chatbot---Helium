/**
 * Test script to verify task 5.2: Replace plain code rendering with SyntaxHighlighter
 * This validates that the CodeBlock component uses SyntaxHighlighter with proper configuration
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('=== Verifying Task 5.2: Replace plain code rendering with SyntaxHighlighter ===\n');

const codeBlockPath = path.join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
const content = fs.readFileSync(codeBlockPath, 'utf-8');

let allTestsPassed = true;

// Test 1: Verify SyntaxHighlighter is imported
console.log('Test 1: Verify SyntaxHighlighter import');
const hasSyntaxHighlighterImport = content.includes("import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'");
if (hasSyntaxHighlighterImport) {
  console.log('✓ PASS: SyntaxHighlighter is imported');
} else {
  console.log('✗ FAIL: SyntaxHighlighter import not found');
  allTestsPassed = false;
}
console.log();

// Test 2: Verify vscDarkPlus theme is imported
console.log('Test 2: Verify vscDarkPlus theme import');
const hasThemeImport = content.includes("import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'");
if (hasThemeImport) {
  console.log('✓ PASS: vscDarkPlus theme is imported');
} else {
  console.log('✗ FAIL: vscDarkPlus theme import not found');
  allTestsPassed = false;
}
console.log();

// Test 3: Verify SyntaxHighlighter component is used in JSX
console.log('Test 3: Verify SyntaxHighlighter component is used');
const usesSyntaxHighlighter = content.includes('<SyntaxHighlighter');
if (usesSyntaxHighlighter) {
  console.log('✓ PASS: SyntaxHighlighter component is used in JSX');
} else {
  console.log('✗ FAIL: SyntaxHighlighter component not found in JSX');
  allTestsPassed = false;
}
console.log();

// Test 4: Verify language prop is passed
console.log('Test 4: Verify language prop is passed to SyntaxHighlighter');
const passesLanguage = content.includes('language={language}');
if (passesLanguage) {
  console.log('✓ PASS: language prop is passed to SyntaxHighlighter');
} else {
  console.log('✗ FAIL: language prop not passed to SyntaxHighlighter');
  allTestsPassed = false;
}
console.log();

// Test 5: Verify vscDarkPlus theme is applied
console.log('Test 5: Verify vscDarkPlus theme is applied');
const appliesTheme = content.includes('style={vscDarkPlus}');
if (appliesTheme) {
  console.log('✓ PASS: vscDarkPlus theme is applied');
} else {
  console.log('✗ FAIL: vscDarkPlus theme not applied');
  allTestsPassed = false;
}
console.log();

// Test 6: Verify inline styles are configured (customStyle prop)
console.log('Test 6: Verify inline styles are configured');
const hasCustomStyle = content.includes('customStyle={{');
if (hasCustomStyle) {
  console.log('✓ PASS: customStyle prop is configured for inline styles');
} else {
  console.log('✗ FAIL: customStyle prop not found');
  allTestsPassed = false;
}
console.log();

// Test 7: Verify code content is passed as children
console.log('Test 7: Verify code content is passed to SyntaxHighlighter');
const passesCode = content.includes('>{code}</SyntaxHighlighter>') || 
                   content.includes('>\n          {code}\n        </SyntaxHighlighter>');
if (passesCode) {
  console.log('✓ PASS: code content is passed as children to SyntaxHighlighter');
} else {
  console.log('✗ FAIL: code content not passed to SyntaxHighlighter');
  allTestsPassed = false;
}
console.log();

// Test 8: Verify plain <pre><code> is removed
console.log('Test 8: Verify plain <pre><code> rendering is removed');
const hasPlainPre = content.includes('<pre className="p-4 text-sm leading-relaxed">');
const hasPlainCode = content.includes('<code className="font-mono text-text-primary whitespace-pre">');
if (!hasPlainPre && !hasPlainCode) {
  console.log('✓ PASS: Plain <pre><code> rendering has been removed');
} else {
  console.log('✗ FAIL: Plain <pre><code> rendering still present');
  allTestsPassed = false;
}
console.log();

// Summary
console.log('=== Summary ===');
if (allTestsPassed) {
  console.log('✅ All tests passed! Task 5.2 is complete.');
  console.log('\nTask 5.2 Requirements Met:');
  console.log('  ✓ Code content wrapped in SyntaxHighlighter component');
  console.log('  ✓ Language prop passed to SyntaxHighlighter');
  console.log('  ✓ vscDarkPlus theme applied');
  console.log('  ✓ Configured to use inline styles');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the failures above.');
  process.exit(1);
}
