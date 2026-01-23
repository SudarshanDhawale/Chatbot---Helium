/**
 * Test script for verifying special character preservation in code blocks
 * Task 8.3: Ensure special characters are preserved
 * Requirements: 6.2
 */

import { renderMarkdown } from '../src/utils/markdown';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

interface TestCase {
  name: string;
  code: string;
  expectedChars: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Unicode emojis',
    code: '🚀 Rocket launch\n💻 Computer\n🎉 Party\n✨ Sparkles',
    expectedChars: ['🚀', '💻', '🎉', '✨'],
  },
  {
    name: 'Special symbols',
    code: '© Copyright\n® Registered\n™ Trademark\n€ Euro\n£ Pound\n¥ Yen',
    expectedChars: ['©', '®', '™', '€', '£', '¥'],
  },
  {
    name: 'Mathematical symbols',
    code: '∑ Sum\n∫ Integral\n√ Square root\n∞ Infinity\n≠ Not equal\n≤ Less than or equal',
    expectedChars: ['∑', '∫', '√', '∞', '≠', '≤'],
  },
  {
    name: 'Greek letters',
    code: 'α alpha\nβ beta\nγ gamma\nδ delta\nπ pi\nΩ omega',
    expectedChars: ['α', 'β', 'γ', 'δ', 'π', 'Ω'],
  },
  {
    name: 'Arrows and symbols',
    code: '→ Right arrow\n← Left arrow\n↑ Up arrow\n↓ Down arrow\n⇒ Double arrow\n• Bullet',
    expectedChars: ['→', '←', '↑', '↓', '⇒', '•'],
  },
  {
    name: 'HTML entities',
    code: '<div>&lt;tag&gt;</div>\n&amp; ampersand\n&quot; quote',
    expectedChars: ['<', '>', '&', '"'],
  },
  {
    name: 'Non-ASCII characters',
    code: 'Café\nNaïve\nÜber\nÑoño\nÇedilla',
    expectedChars: ['é', 'ï', 'Ü', 'Ñ', 'ñ', 'Ç'],
  },
  {
    name: 'Chinese characters',
    code: '你好世界\n中文测试',
    expectedChars: ['你', '好', '世', '界', '中', '文', '测', '试'],
  },
  {
    name: 'Japanese characters',
    code: 'こんにちは\nテスト',
    expectedChars: ['こ', 'ん', 'に', 'ち', 'は', 'テ', 'ス', 'ト'],
  },
  {
    name: 'Korean characters',
    code: '안녕하세요\n테스트',
    expectedChars: ['안', '녕', '하', '세', '요', '테', '스', '트'],
  },
  {
    name: 'Arabic characters',
    code: 'مرحبا\nاختبار',
    expectedChars: ['م', 'ر', 'ح', 'ب', 'ا', 'خ', 'ت', 'ب', 'ر'],
  },
  {
    name: 'Mixed special characters',
    code: '🚀 const π = 3.14;\n// © 2024 → ∞\nlet café = "naïve";\n/* ✨ Über cool ✨ */',
    expectedChars: ['🚀', 'π', '©', '→', '∞', 'é', 'ï', 'Ü', '✨'],
  },
  {
    name: 'Tab characters',
    code: 'function test() {\n\treturn true;\n}',
    expectedChars: ['\t'],
  },
  {
    name: 'Newline characters',
    code: 'line1\nline2\r\nline3',
    expectedChars: ['\n'],
  },
  {
    name: 'Zero-width characters',
    code: 'test\u200Bword\u200Ctest\u200Dtest',
    expectedChars: ['\u200B', '\u200C', '\u200D'],
  },
  {
    name: 'Combining diacritics',
    code: 'e\u0301 (é)\na\u0300 (à)\no\u0302 (ô)',
    expectedChars: ['\u0301', '\u0300', '\u0302'],
  },
  {
    name: 'Box drawing characters',
    code: '┌─┬─┐\n│ │ │\n├─┼─┤\n│ │ │\n└─┴─┘',
    expectedChars: ['┌', '─', '┬', '┐', '│', '├', '┼', '┤', '└', '┴', '┘'],
  },
  {
    name: 'Braille characters',
    code: '⠃⠗⠁⠊⠇⠇⠑',
    expectedChars: ['⠃', '⠗', '⠁', '⠊', '⠇', '⠑'],
  },
];

function testSpecialCharacterPreservation() {
  console.log('Testing special character preservation in code blocks...\n');
  
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    try {
      // Create markdown with code block
      const markdown = `\`\`\`javascript\n${testCase.code}\n\`\`\``;
      
      // Render markdown
      const element = renderMarkdown(markdown);
      
      // Convert to HTML string
      const html = element ? renderToStaticMarkup(element as React.ReactElement) : '';
      
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
        console.log(`  Code: ${testCase.code.substring(0, 50)}...`);
        // Debug: show a snippet of the HTML
        if (testCase.name === 'HTML entities') {
          console.log(`  HTML snippet: ${html.substring(0, 300)}...`);
        }
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
const success = testSpecialCharacterPreservation();
process.exit(success ? 0 : 1);
