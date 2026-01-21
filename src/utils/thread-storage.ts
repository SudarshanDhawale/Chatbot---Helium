/**
 * Utilities for storing and retrieving thread information
 */

import type { ThreadSummary } from '@/types/thread';

const STORAGE_KEY = 'helium-chat-threads';
const MAX_THREADS = 50;

export function saveThread(thread: ThreadSummary): void {
  try {
    const threads = getThreads();
    
    // Remove existing thread if it exists
    const filtered = threads.filter((t) => t.threadId !== thread.threadId);
    
    // Add new thread at the beginning
    const updated = [thread, ...filtered].slice(0, MAX_THREADS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save thread:', error);
  }
}

export function getThreads(): ThreadSummary[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const threads = JSON.parse(stored) as ThreadSummary[];
    // Convert date strings back to Date objects
    const threadsWithDates = threads.map((thread) => ({
      ...thread,
      lastUpdated: new Date(thread.lastUpdated),
    }));
    
    // Sort by lastUpdated in descending order (most recent first)
    return threadsWithDates.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  } catch (error) {
    console.error('Failed to get threads:', error);
    return [];
  }
}

export function updateThread(
  threadId: string,
  updates: Partial<ThreadSummary>
): void {
  try {
    const threads = getThreads();
    const index = threads.findIndex((t) => t.threadId === threadId);
    
    if (index !== -1) {
      threads[index] = { ...threads[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    }
  } catch (error) {
    console.error('Failed to update thread:', error);
  }
}

export function deleteThread(threadId: string): void {
  try {
    const threads = getThreads().filter((t) => t.threadId !== threadId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (error) {
    console.error('Failed to delete thread:', error);
  }
}

export function getThread(threadId: string): ThreadSummary | null {
  const threads = getThreads();
  return threads.find((t) => t.threadId === threadId) || null;
}
