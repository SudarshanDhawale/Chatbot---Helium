/**
 * Test script to verify tab character handling in code blocks
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CodeBlock } from '../src/components/chat/CodeBlock';

// Test code samples with tabs
const codeWithTabs = `function example() {
\tconsole.log("This line has 1 tab");
\t\tconsole.log("This line has 2 tabs");
\t\t\tconsole.log("This line has 3 tabs");
}`;

const codeWithMixedTabsAndSpaces = `function mixed() {
\tconsole.log("Tab indent");
    console.log("4 spaces indent");
\t    console.log("Tab + 4 spaces");
        console.log("8 spaces indent");
}`;

const pythonWithTabs = `def example():
\tprint("This line has 1 tab")
\tif True:
\t\tprint("This line has 2 tabs")
\t\tfor i in range(3):
\t\t\tprint(f"This line has 3 tabs: {i}")`;

function TestTabHandling() {
  return (
    <div style={{ padding: '2rem', background: '#0a0e1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Tab Character Handling Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>JavaScript with Tabs</h2>
        <CodeBlock language="javascript" code={codeWithTabs} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Mixed Tabs and Spaces</h2>
        <CodeBlock language="javascript" code={codeWithMixedTabsAndSpaces} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Python with Tabs</h2>
        <CodeBlock language="python" code={pythonWithTabs} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Tab Character Info</h2>
        <div style={{ color: '#fff', background: '#1a1f2e', padding: '1rem', borderRadius: '0.5rem' }}>
          <p>Each tab should render as 4 spaces by default.</p>
          <p>Tabs should be consistent across all code blocks.</p>
          <p>Mixed tabs and spaces should be clearly distinguishable.</p>
        </div>
      </div>
    </div>
  );
}

// Mount the test component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestTabHandling />);
}
