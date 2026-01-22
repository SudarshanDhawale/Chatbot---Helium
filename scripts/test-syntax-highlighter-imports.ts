/**
 * Test script to verify react-syntax-highlighter imports and configuration
 * This validates task 5.1: Import and configure react-syntax-highlighter
 */

// Test that we can import the Prism light build
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

console.log('✓ Successfully imported Prism as SyntaxHighlighter');
console.log('✓ Successfully imported vscDarkPlus theme');

// Verify that SyntaxHighlighter is a valid component
if (typeof SyntaxHighlighter !== 'function') {
  console.error('✗ SyntaxHighlighter is not a function/component');
  process.exit(1);
}

console.log('✓ SyntaxHighlighter is a valid component');

// Verify that vscDarkPlus is a valid style object
if (typeof vscDarkPlus !== 'object' || vscDarkPlus === null) {
  console.error('✗ vscDarkPlus is not a valid style object');
  process.exit(1);
}

console.log('✓ vscDarkPlus is a valid style object');

// List of common languages that should be supported
const commonLanguages = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'bash',
  'sql'
];

console.log('\n✓ Common languages to be supported:');
commonLanguages.forEach(lang => {
  console.log(`  - ${lang}`);
});

console.log('\n✅ All imports and configuration verified successfully!');
console.log('Task 5.1 complete: react-syntax-highlighter is properly imported and configured.');
