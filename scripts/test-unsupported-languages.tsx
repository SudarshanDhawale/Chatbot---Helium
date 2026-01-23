/**
 * Test script to verify fallback behavior for unsupported languages
 * This tests requirement 5.5: unsupported languages should display without errors
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { CodeBlock } from '../src/components/chat/CodeBlock';

// Test cases with various invalid/unsupported language identifiers
const testCases = [
  {
    name: 'Invalid language identifier',
    language: 'invalidlang123',
    code: 'console.log("Hello World");',
  },
  {
    name: 'Random string as language',
    language: 'xyz-abc-random',
    code: 'function test() {\n  return true;\n}',
  },
  {
    name: 'Empty language',
    language: '',
    code: 'const x = 42;',
  },
  {
    name: 'Special characters in language',
    language: '!@#$%',
    code: 'print("test")',
  },
  {
    name: 'Very long language name',
    language: 'thisisaverylonglanguagenamethatdoesnotexist',
    code: 'SELECT * FROM users;',
  },
  {
    name: 'Numeric language',
    language: '12345',
    code: 'import os\nprint(os.getcwd())',
  },
  {
    name: 'Mixed case unsupported language',
    language: 'UnSuPpOrTeD',
    code: '<div>Hello</div>',
  },
];

console.log('Testing CodeBlock fallback for unsupported languages...\n');

let passedTests = 0;
let failedTests = 0;

for (const testCase of testCases) {
  try {
    console.log(`Testing: ${testCase.name}`);
    console.log(`  Language: "${testCase.language}"`);
    
    // Try to render the component
    const html = renderToString(
      React.createElement(CodeBlock, {
        language: testCase.language,
        code: testCase.code,
      })
    );
    
    // Check that HTML was generated (component didn't crash)
    if (html && html.length > 0) {
      // Check that the code content is present in the output (may be HTML-escaped or have normalized whitespace)
      const escapedCode = testCase.code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      // Also check for individual lines (in case newlines are handled differently)
      const codeLines = testCase.code.split('\n');
      const allLinesPresent = codeLines.every(line => 
        line.trim() === '' || html.includes(line) || html.includes(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      );
      
      if (html.includes(testCase.code) || html.includes(escapedCode) || allLinesPresent) {
        console.log(`  ✓ PASSED: Component rendered without errors and code is present\n`);
        passedTests++;
      } else {
        console.log(`  ✗ FAILED: Code content not found in output`);
        console.log(`  Expected to find: "${testCase.code}"`);
        console.log(`  Or escaped: "${escapedCode}"`);
        console.log(`  HTML length: ${html.length}\n`);
        failedTests++;
      }
    } else {
      console.log(`  ✗ FAILED: No HTML output generated\n`);
      failedTests++;
    }
  } catch (error) {
    console.log(`  ✗ FAILED: Component threw error: ${error}\n`);
    failedTests++;
  }
}

console.log('='.repeat(60));
console.log(`Test Results: ${passedTests} passed, ${failedTests} failed`);
console.log('='.repeat(60));

if (failedTests > 0) {
  process.exit(1);
}

console.log('\n✓ All tests passed! Fallback behavior works correctly.');
