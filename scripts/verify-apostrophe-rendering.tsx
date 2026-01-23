/**
 * Verify that apostrophes render correctly even if HTML-encoded
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CodeBlock } from '../src/components/chat/CodeBlock';

const testCode = `const message = 'Hello World';
const name = 'John';
console.log('Test');`;

console.log('Testing apostrophe rendering...\n');

// Render the CodeBlock
const element = React.createElement(CodeBlock, {
  language: 'javascript',
  code: testCode,
});

const html = renderToStaticMarkup(element);

console.log('Original code:');
console.log(testCode);
console.log('\n' + '='.repeat(60) + '\n');

console.log('Rendered HTML (excerpt):');
// Find the code content in the HTML
const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
if (codeMatch) {
  console.log(codeMatch[1].substring(0, 200));
} else {
  console.log('Could not find code tag');
}

console.log('\n' + '='.repeat(60) + '\n');

// Check if apostrophes are present (either as ' or &#x27; or &apos;)
const hasApostrophe = html.includes("'");
const hasEncodedApostrophe = html.includes('&#x27;') || html.includes('&apos;') || html.includes('&#39;');

console.log('Analysis:');
console.log(`  Contains literal apostrophe ('): ${hasApostrophe}`);
console.log(`  Contains HTML-encoded apostrophe: ${hasEncodedApostrophe}`);

if (hasApostrophe || hasEncodedApostrophe) {
  console.log('\n✓ Apostrophes are preserved (either literal or HTML-encoded)');
  console.log('  Note: HTML-encoded apostrophes will render correctly in the browser');
  console.log('  The browser automatically decodes HTML entities when displaying content');
} else {
  console.log('\n✗ Apostrophes are missing!');
  process.exit(1);
}
