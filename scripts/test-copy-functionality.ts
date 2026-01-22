/**
 * Test script for CodeBlock copy functionality
 * Tests that the copy button copies raw code without formatting
 */

// Mock clipboard API for testing
class MockClipboard {
  private content: string = '';
  private shouldFail: boolean = false;

  async writeText(text: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Clipboard write failed');
    }
    this.content = text;
  }

  getContent(): string {
    return this.content;
  }

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }
}

// Simulate the handleCopy function from CodeBlock
async function simulateHandleCopy(code: string, clipboard: MockClipboard): Promise<{ success: boolean; error?: string }> {
  try {
    await clipboard.writeText(code);
    return { success: true };
  } catch (error) {
    console.error('Failed to copy code to clipboard:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Main test function
async function runTests() {
  console.log('=== Testing CodeBlock Copy Functionality ===\n');

  const mockClipboard = new MockClipboard();

  // Test 1: Copy simple code
  // Test 1: Copy simple code
  console.log('Test 1: Copy simple code');
  const simpleCode = 'console.log("Hello World");';
  const result1 = await simulateHandleCopy(simpleCode, mockClipboard);
  console.log('Code to copy:', simpleCode);
  console.log('Clipboard content:', mockClipboard.getContent());
  console.log('✓ Expected: Clipboard contains exact code');
  console.log('✓ Actual:', mockClipboard.getContent() === simpleCode && result1.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 2: Copy code with special characters
  console.log('Test 2: Copy code with special characters');
  const specialCode = 'echo "Hello $USER" | grep -E "^[a-z]+$"';
  const result2 = await simulateHandleCopy(specialCode, mockClipboard);
  console.log('Code to copy:', specialCode);
  console.log('Clipboard content:', mockClipboard.getContent());
  console.log('✓ Expected: Special characters preserved');
  console.log('✓ Actual:', mockClipboard.getContent() === specialCode && result2.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 3: Copy multiline code with indentation
  console.log('Test 3: Copy multiline code with indentation');
  const multilineCode = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`;
  const result3 = await simulateHandleCopy(multilineCode, mockClipboard);
  console.log('Code to copy:');
  console.log(multilineCode);
  console.log('Clipboard content:');
  console.log(mockClipboard.getContent());
  console.log('✓ Expected: Indentation and newlines preserved');
  console.log('✓ Actual:', mockClipboard.getContent() === multilineCode && result3.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 4: Copy code with Unicode characters
  console.log('Test 4: Copy code with Unicode characters');
  const unicodeCode = '// 🚀 Rocket function\nconst rocket = "🚀";\nconsole.log(`Launch ${rocket}!`);';
  const result4 = await simulateHandleCopy(unicodeCode, mockClipboard);
  console.log('Code to copy:', unicodeCode);
  console.log('Clipboard content:', mockClipboard.getContent());
  console.log('✓ Expected: Unicode characters preserved');
  console.log('✓ Actual:', mockClipboard.getContent() === unicodeCode && result4.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 5: Copy empty code
  console.log('Test 5: Copy empty code');
  const emptyCode = '';
  const result5 = await simulateHandleCopy(emptyCode, mockClipboard);
  console.log('Code to copy: (empty string)');
  console.log('Clipboard content: (empty string)');
  console.log('✓ Expected: Empty string copied successfully');
  console.log('✓ Actual:', mockClipboard.getContent() === emptyCode && result5.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 6: Copy with tabs and mixed whitespace
  console.log('Test 6: Copy code with tabs and mixed whitespace');
  const tabCode = 'function test() {\n\tif (true) {\n\t\treturn "tab indented";\n\t}\n}';
  const result6 = await simulateHandleCopy(tabCode, mockClipboard);
  console.log('Code to copy:');
  console.log(JSON.stringify(tabCode)); // Show tabs as \t
  console.log('Clipboard content:');
  console.log(JSON.stringify(mockClipboard.getContent()));
  console.log('✓ Expected: Tabs preserved exactly');
  console.log('✓ Actual:', mockClipboard.getContent() === tabCode && result6.success ? 'PASS' : 'FAIL');
  console.log();

  // Test 7: Error handling - clipboard failure
  console.log('Test 7: Error handling - clipboard failure');
  mockClipboard.setShouldFail(true);
  const errorCode = 'console.log("test");';
  const result7 = await simulateHandleCopy(errorCode, mockClipboard);
  console.log('Code to copy:', errorCode);
  console.log('Copy result:', result7);
  console.log('✓ Expected: Copy fails gracefully, returns success=false');
  console.log('✓ Actual:', !result7.success && result7.error ? 'PASS' : 'FAIL');
  console.log();

  // Reset clipboard for final test
  mockClipboard.setShouldFail(false);

  // Test 8: Very long code (performance test)
  console.log('Test 8: Copy very long code');
  const longCode = Array(1000).fill('console.log("line");').join('\n');
  const result8 = await simulateHandleCopy(longCode, mockClipboard);
  console.log('Code length:', longCode.length, 'characters');
  console.log('Clipboard content length:', mockClipboard.getContent().length, 'characters');
  console.log('✓ Expected: Long code copied completely');
  console.log('✓ Actual:', mockClipboard.getContent() === longCode && result8.success ? 'PASS' : 'FAIL');
  console.log();

  console.log('=== Copy Functionality Tests Complete ===');

  // Summary
  const allTests = [result1, result2, result3, result4, result5, result6, result8];
  const passedTests = allTests.filter(r => r.success).length;
  const errorTest = !result7.success; // Error test should fail

  console.log(`\n=== Summary ===`);
  console.log(`Successful copy tests: ${passedTests}/${allTests.length}`);
  console.log(`Error handling test: ${errorTest ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${passedTests === allTests.length && errorTest ? 'ALL TESTS PASS' : 'SOME TESTS FAILED'}`);
}

// Run the tests
runTests().catch(console.error);