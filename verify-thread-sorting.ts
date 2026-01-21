/**
 * Verification script for thread sorting
 * This script tests that threads are sorted by lastUpdated in descending order
 */

import type { ThreadSummary } from './src/types/thread';

// Mock localStorage for testing
const mockStorage: { [key: string]: string } = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
  length: 0,
  key: () => null,
} as Storage;

// Import after mocking localStorage
const { getThreads, saveThread } = require('./src/utils/thread-storage');

// Test data with different timestamps
const testThreads: ThreadSummary[] = [
  {
    threadId: 'thread-1',
    projectId: 'project-1',
    title: 'Oldest Thread',
    lastMessage: 'This is the oldest',
    lastUpdated: new Date('2024-01-01T10:00:00Z'),
    messageCount: 5,
  },
  {
    threadId: 'thread-2',
    projectId: 'project-1',
    title: 'Middle Thread',
    lastMessage: 'This is in the middle',
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
    messageCount: 3,
  },
  {
    threadId: 'thread-3',
    projectId: 'project-1',
    title: 'Newest Thread',
    lastMessage: 'This is the newest',
    lastUpdated: new Date('2024-02-01T10:00:00Z'),
    messageCount: 10,
  },
];

console.log('Testing thread sorting...\n');

// Save threads in random order
console.log('Saving threads in random order:');
testThreads.forEach(thread => {
  console.log(`  - ${thread.title} (${thread.lastUpdated.toISOString()})`);
  saveThread(thread);
});

// Retrieve threads
console.log('\nRetrieving threads:');
const retrievedThreads = getThreads();

// Verify sorting
console.log('\nRetrieved threads order:');
retrievedThreads.forEach((thread: ThreadSummary, index: number) => {
  console.log(`  ${index + 1}. ${thread.title} (${thread.lastUpdated.toISOString()})`);
});

// Check if sorted correctly (descending order)
let isSorted = true;
for (let i = 0; i < retrievedThreads.length - 1; i++) {
  if (retrievedThreads[i].lastUpdated.getTime() < retrievedThreads[i + 1].lastUpdated.getTime()) {
    isSorted = false;
    console.log(`\n❌ ERROR: Thread at index ${i} is older than thread at index ${i + 1}`);
    break;
  }
}

if (isSorted) {
  console.log('\n✅ SUCCESS: Threads are correctly sorted by lastUpdated in descending order');
  console.log('   (Most recent first)');
} else {
  console.log('\n❌ FAILED: Threads are NOT sorted correctly');
  process.exit(1);
}

// Test that the newest thread is first
if (retrievedThreads[0].threadId === 'thread-3') {
  console.log('✅ Newest thread is first');
} else {
  console.log('❌ Newest thread is NOT first');
  process.exit(1);
}

// Test that the oldest thread is last
if (retrievedThreads[retrievedThreads.length - 1].threadId === 'thread-1') {
  console.log('✅ Oldest thread is last');
} else {
  console.log('❌ Oldest thread is NOT last');
  process.exit(1);
}

console.log('\n✅ All tests passed!');
