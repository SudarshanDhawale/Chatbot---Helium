/**
 * Automated verification script for code block functionality
 * This script performs basic checks on the implementation
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
  console.log(`${condition ? '✅' : '❌'} ${name}: ${message}`);
}

console.log('🧪 Verifying Code Block Implementation\n');

// Test 1: Check if CodeBlock component exists
try {
  const codeBlockPath = join(process.cwd(), 'src/components/chat/CodeBlock.tsx');
  const codeBlockContent = readFileSync(codeBlockPath, 'utf-8');
  
  test(
    'CodeBlock Component',
    codeBlockContent.includes('export function CodeBlock'),
    'CodeBlock component exists'
  );
  
  test(
    'Syntax Highlighter Import',
    codeBlockContent.includes('react-syntax-highlighter'),
    'react-syntax-highlighter is imported'
  );
  
  test(
    'VS Code Dark Theme',
    codeBlockContent.includes('vscDarkPlus'),
    'vscDarkPlus theme is imported'
  );
  
  test(
    'Copy Functionality',
    codeBlockContent.includes('navigator.clipboard.writeText'),
    'Copy to clipboard functionality exists'
  );
  
  test(
    'Scrollable Container',
    codeBlockContent.includes('maxHeight') && codeBlockContent.includes('overflow'),
    'Scrollable container with maxHeight and overflow'
  );
  
  test(
    'Empty Block Handling',
    codeBlockContent.includes('Empty code block'),
    'Empty code block placeholder exists'
  );
  
  test(
    'Error Handling',
    codeBlockContent.includes('try') && codeBlockContent.includes('catch'),
    'Error handling implemented'
  );
  
} catch (error) {
  test('CodeBlock Component', false, `Failed to read file: ${error}`);
}

// Test 2: Check if markdown parser has code block detection
try {
  const markdownPath = join(process.cwd(), 'src/utils/markdown.tsx');
  const markdownContent = readFileSync(markdownPath, 'utf-8');
  
  test(
    'Markdown Parser',
    markdownContent.includes('detectCodeBlock'),
    'detectCodeBlock function exists'
  );
  
  test(
    'Code Block Type',
    markdownContent.includes("type: 'code'"),
    'Code block type defined in MarkdownBlock'
  );
  
  test(
    'Language Property',
    markdownContent.includes('language?:'),
    'Language property exists in MarkdownBlock interface'
  );
  
  test(
    'Code Property',
    markdownContent.includes('code?:'),
    'Code property exists in MarkdownBlock interface'
  );
  
  test(
    'Code Fence Detection',
    markdownContent.includes('```') || markdownContent.includes('startsWith'),
    'Code fence detection logic exists'
  );
  
  test(
    'CodeBlock Import',
    markdownContent.includes("from '@/components/chat/CodeBlock'"),
    'CodeBlock component is imported in markdown parser'
  );
  
  test(
    'CodeBlock Rendering',
    markdownContent.includes('<CodeBlock'),
    'CodeBlock component is rendered in markdown parser'
  );
  
} catch (error) {
  test('Markdown Parser', false, `Failed to read file: ${error}`);
}

// Test 3: Check if package.json has required dependencies
try {
  const packagePath = join(process.cwd(), 'package.json');
  const packageContent = readFileSync(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageContent);
  
  test(
    'react-syntax-highlighter Dependency',
    !!packageJson.dependencies['react-syntax-highlighter'],
    `Version: ${packageJson.dependencies['react-syntax-highlighter'] || 'NOT FOUND'}`
  );
  
  test(
    'Type Definitions',
    !!packageJson.dependencies['@types/react-syntax-highlighter'],
    `Version: ${packageJson.dependencies['@types/react-syntax-highlighter'] || 'NOT FOUND'}`
  );
  
} catch (error) {
  test('Dependencies', false, `Failed to read package.json: ${error}`);
}

// Summary
console.log('\n📊 Test Summary\n');
const passed = results.filter(r => r.passed).length;
const total = results.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Passed: ${passed}/${total} (${percentage}%)`);

if (passed === total) {
  console.log('\n✅ All automated checks passed!');
  console.log('📝 Ready for manual testing.');
  console.log('\nNext steps:');
  console.log('1. Open test-code-blocks.html for quick visual check');
  console.log('2. Run the application and use TEST_MESSAGES.md');
  console.log('3. Document results in MANUAL_TEST_RESULTS.md');
} else {
  console.log('\n⚠️  Some checks failed. Review the implementation.');
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.message}`);
  });
}

console.log('\n');
