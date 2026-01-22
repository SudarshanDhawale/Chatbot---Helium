/**
 * Integration test for special character preservation in CodeBlock component
 * Task 8.3: Ensure special characters are preserved
 * Requirements: 6.2
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CodeBlock } from '../src/components/chat/CodeBlock';

interface TestCase {
  name: string;
  language: string;
  code: string;
  expectedChars: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Unicode emojis in JavaScript',
    language: 'javascript',
    code: '🚀 const rocket = "launch";\n💻 const computer = "code";\n🎉 const party = "celebrate";',
    expectedChars: ['🚀', '💻', '🎉'],
  },
  {
    name: 'Mathematical symbols in Python',
    language: 'python',
    code: '# Calculate π\nπ = 3.14159\n# Sum ∑\nresult = ∑(values)\n# Infinity ∞\nmax_value = ∞',
    expectedChars: ['π', '∑', '∞'],
  },
  {
    name: 'Greek letters in code',
    language: 'typescript',
    code: 'const α = 1.5;\nconst β = 2.0;\nconst γ = 3.14;\nconst δ = 0.5;',
    expectedChars: ['α', 'β', 'γ', 'δ'],
  },
  {
    name: 'Chinese characters',
    language: 'javascript',
    code: 'const 你好 = "Hello";\nconst 世界 = "World";\nconsole.log(你好 + 世界);',
    expectedChars: ['你', '好', '世', '界'],
  },
  {
    name: 'Japanese characters',
    language: 'javascript',
    code: 'const こんにちは = "Hello";\nconst テスト = "Test";',
    expectedChars: ['こ', 'ん', 'に', 'ち', 'は', 'テ', 'ス', 'ト'],
  },
  {
    name: 'Korean characters',
    language: 'javascript',
    code: 'const 안녕하세요 = "Hello";\nconst 테스트 = "Test";',
    expectedChars: ['안', '녕', '하', '세', '요', '테', '스', '트'],
  },
  {
    name: 'Box drawing characters',
    language: 'text',
    code: '┌─┬─┐\n│ │ │\n├─┼─┤\n│ │ │\n└─┴─┘',
    expectedChars: ['┌', '─', '┬', '┐', '│', '├', '┼', '┤', '└', '┴', '┘'],
  },
  {
    name: 'Special symbols',
    language: 'javascript',
    code: '// © 2024 Company™\nconst price = "€100";\nconst registered = "®";',
    expectedChars: ['©', '™', '€', '®'],
  },
  {
    name: 'Arrows and symbols',
    language: 'text',
    code: 'Start → Process → End\n↑ Up\n↓ Down\n← Left\n→ Right',
    expectedChars: ['→', '↑', '↓', '←'],
  },
  {
    name: 'Non-ASCII accented characters',
    language: 'javascript',
    code: 'const café = "Café";\nconst naïve = "Naïve";\nconst über = "Über";',
    expectedChars: ['é', 'ï', 'ü'],
  },
  {
    name: 'Tab characters',
    language: 'javascript',
    code: 'function test() {\n\treturn true;\n}',
    expectedChars: ['\t'],
  },
  {
    name: 'Mixed special characters',
    language: 'javascript',
    code: '🚀 const π = 3.14;\n// © 2024 → ∞\nlet café = "naïve";\n/* ✨ Über cool ✨ */',
    expectedChars: ['🚀', 'π', '©', '→', '∞', 'é', 'ï', 'Ü', '✨'],
  },
];

function testCodeBlockSpecialCharacters() {
  console.log('Testing special character preservation in CodeBlock component...\n');
  
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    try {
      // Render the CodeBlock component
      const element = React.createElement(CodeBlock, {
        language: testCase.language,
        code: testCase.code,
      });
      
      // Convert to HTML string
      const html = renderToStaticMarkup(element);
      
      // Check if all expected characters are present in the HTML
      let allPresent = true;
      const missingChars: string[] = [];
      
      for (const char of testCase.expectedChars) {
        if (!html.includes(char)) {
          allPresent = false;
          missingChars.push(char);
        }
      }
      
      if (allPresent) {
        console.log(`✓ ${testCase.name}: PASSED`);
        passed++;
      } else {
        console.log(`✗ ${testCase.name}: FAILED`);
        console.log(`  Missing characters: ${missingChars.join(', ')}`);
        console.log(`  Language: ${testCase.language}`);
        console.log(`  Code snippet: ${testCase.code.substring(0, 50)}...`);
        failed++;
        failures.push(testCase.name);
      }
    } catch (error) {
      console.log(`✗ ${testCase.name}: ERROR`);
      console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
      failures.push(testCase.name);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(name => console.log(`  - ${name}`));
  }
  
  console.log('='.repeat(60));
  
  return failed === 0;
}

// Run the test
const success = testCodeBlockSpecialCharacters();
process.exit(success ? 0 : 1);
