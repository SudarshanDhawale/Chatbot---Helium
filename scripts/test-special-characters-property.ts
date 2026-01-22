/**
 * Property-based test for special character preservation
 * Task 8.4: Write property test for special character preservation
 * Property 10: Special Character Preservation
 * Validates: Requirements 6.2
 */

import fc from 'fast-check';
import { renderMarkdown } from '../src/utils/markdown';
import { renderToStaticMarkup } from 'react-dom/server';

// Generator for Unicode characters including special characters
const unicodeCharGenerator = fc.oneof(
  // Basic Latin with special chars
  fc.integer({ min: 32, max: 126 }).map(n => String.fromCharCode(n)),
  // Latin-1 Supplement (accented characters)
  fc.integer({ min: 160, max: 255 }).map(n => String.fromCharCode(n)),
  // Greek and Coptic
  fc.integer({ min: 0x0370, max: 0x03FF }).map(n => String.fromCharCode(n)),
  // CJK Unified Ideographs (common Chinese characters)
  fc.integer({ min: 0x4E00, max: 0x4E99 }).map(n => String.fromCharCode(n)),
  // Hiragana (Japanese)
  fc.integer({ min: 0x3040, max: 0x309F }).map(n => String.fromCharCode(n)),
  // Katakana (Japanese)
  fc.integer({ min: 0x30A0, max: 0x30FF }).map(n => String.fromCharCode(n)),
  // Hangul Syllables (Korean)
  fc.integer({ min: 0xAC00, max: 0xAC99 }).map(n => String.fromCharCode(n)),
  // Mathematical Operators
  fc.integer({ min: 0x2200, max: 0x22FF }).map(n => String.fromCharCode(n)),
  // Box Drawing
  fc.integer({ min: 0x2500, max: 0x257F }).map(n => String.fromCharCode(n)),
  // Arrows
  fc.integer({ min: 0x2190, max: 0x21FF }).map(n => String.fromCharCode(n)),
  // Miscellaneous Symbols (including emojis)
  fc.integer({ min: 0x2600, max: 0x26FF }).map(n => String.fromCharCode(n)),
  // Emoticons (emojis)
  fc.integer({ min: 0x1F600, max: 0x1F64F }).map(n => String.fromCodePoint(n)),
  // Miscellaneous Symbols and Pictographs (more emojis)
  fc.integer({ min: 0x1F300, max: 0x1F5FF }).map(n => String.fromCodePoint(n)),
  // Transport and Map Symbols (emojis)
  fc.integer({ min: 0x1F680, max: 0x1F6FF }).map(n => String.fromCodePoint(n)),
  // Tab character
  fc.constant('\t'),
  // Newline character
  fc.constant('\n'),
  // Zero-width characters
  fc.oneof(
    fc.constant('\u200B'), // Zero Width Space
    fc.constant('\u200C'), // Zero Width Non-Joiner
    fc.constant('\u200D')  // Zero Width Joiner
  )
);

// Generator for strings with special characters
const specialCharStringGenerator = fc.array(unicodeCharGenerator, { minLength: 1, maxLength: 50 })
  .map(chars => chars.join(''));

// Generator for code with special characters
const specialCharCodeGenerator = fc.array(specialCharStringGenerator, { minLength: 1, maxLength: 10 })
  .map(lines => lines.join('\n'));

// Generator for programming languages
const languageGenerator = fc.oneof(
  fc.constant('javascript'),
  fc.constant('typescript'),
  fc.constant('python'),
  fc.constant('html'),
  fc.constant('css'),
  fc.constant('json'),
  fc.constant('bash'),
  fc.constant('sql'),
  fc.constant('text')
);

/**
 * Property 10: Special Character Preservation
 * For any code content containing special characters or Unicode, 
 * the rendered code block should preserve and display all characters exactly as provided.
 */
function testSpecialCharacterPreservationProperty() {
  console.log('Running Property 10: Special Character Preservation...\n');
  
  let iterations = 0;
  let failures = 0;
  const failureExamples: Array<{ language: string; code: string; missingChars: string[] }> = [];

  try {
    fc.assert(
      fc.property(languageGenerator, specialCharCodeGenerator, (language, code) => {
        iterations++;
        
        // Create markdown with code block
        const markdown = `\`\`\`${language}\n${code}\n\`\`\``;
        
        // Render markdown
        const element = renderMarkdown(markdown);
        
        // Convert to HTML string
        const html = element ? renderToStaticMarkup(element as React.ReactElement) : '';
        
        // Extract all unique characters from the original code
        const originalChars = Array.from(new Set(code.split('')));
        
        // Check if all original characters are preserved in the HTML
        // Note: Some characters may be HTML-encoded (e.g., ' becomes &#x27;)
        const missingChars: string[] = [];
        for (const char of originalChars) {
          // Check for literal character or common HTML encodings
          const charCode = char.charCodeAt(0);
          const htmlEncodings = [
            char, // Literal character
            `&#${charCode};`, // Decimal encoding
            `&#x${charCode.toString(16)};`, // Hex encoding (lowercase)
            `&#x${charCode.toString(16).toUpperCase()};`, // Hex encoding (uppercase)
          ];
          
          // Special cases for common HTML entities
          if (char === '<') htmlEncodings.push('&lt;');
          if (char === '>') htmlEncodings.push('&gt;');
          if (char === '&') htmlEncodings.push('&amp;');
          if (char === '"') htmlEncodings.push('&quot;');
          if (char === "'") htmlEncodings.push('&apos;', '&#39;');
          
          const isPresent = htmlEncodings.some(encoding => html.includes(encoding));
          
          if (!isPresent) {
            missingChars.push(char);
          }
        }
        
        if (missingChars.length > 0) {
          failures++;
          failureExamples.push({ language, code: code.substring(0, 100), missingChars });
          
          // Log first few failures for debugging
          if (failures <= 3) {
            console.log(`Failure ${failures}:`);
            console.log(`  Language: ${language}`);
            console.log(`  Code: ${code.substring(0, 50)}...`);
            console.log(`  Missing chars: ${missingChars.map(c => `'${c}' (U+${c.charCodeAt(0).toString(16).toUpperCase()})`).join(', ')}`);
            console.log('');
          }
        }
        
        // Property: All characters should be preserved
        return missingChars.length === 0;
      }),
      { 
        numRuns: 100,
        verbose: false,
        seed: 42 // For reproducible results
      }
    );
    
    console.log(`✓ Property 10: PASSED (${iterations} iterations)`);
    console.log(`  All special characters preserved across all test cases`);
    return true;
    
  } catch (error) {
    console.log(`✗ Property 10: FAILED (${iterations} iterations)`);
    console.log(`  Failures: ${failures}/${iterations}`);
    
    if (failureExamples.length > 0) {
      console.log('\nFailure examples:');
      failureExamples.slice(0, 5).forEach((example, i) => {
        console.log(`  ${i + 1}. Language: ${example.language}`);
        console.log(`     Code: ${example.code}...`);
        console.log(`     Missing: ${example.missingChars.slice(0, 5).join(', ')}`);
      });
    }
    
    console.log(`\nError: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Run the property test
console.log('Feature: scrollable-code-blocks, Property 10: Special Character Preservation');
console.log('Validates: Requirements 6.2\n');

const success = testSpecialCharacterPreservationProperty();

console.log('\n' + '='.repeat(60));
console.log(success ? 'PROPERTY TEST PASSED' : 'PROPERTY TEST FAILED');
console.log('='.repeat(60));

process.exit(success ? 0 : 1);