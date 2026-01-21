/**
 * Client-side database service (calls API routes)
 */

import type { ChatMessage } from '@/types/chat';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
}

export interface Thread {
  id: string;
  user_id: string;
  thread_id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
}

export class DBClient {
  /**
   * Get or create a user
   */
  static async getOrCreateUser(email: string, userData?: { username?: string; full_name?: string }): Promise<User> {
    const response = await fetch('/api/db/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...userData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get/create user');
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const response = await fetch(`/api/db/user?email=${encodeURIComponent(email)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Get all threads for a user
   */
  static async getUserThreads(userId: string): Promise<Thread[]> {
    const response = await fetch(`/api/db/threads?user_id=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get threads');
    }

    const data = await response.json();
    return data.threads;
  }

  /**
   * Create a new thread
   */
  static async createThread(
    userId: string,
    threadId: string,
    projectId: string,
    title: string
  ): Promise<Thread> {
    const response = await fetch('/api/db/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        thread_id: threadId,
        project_id: projectId,
        title,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create thread');
    }

    const data = await response.json();
    return data.thread;
  }

  /**
   * Get messages for a thread
   */
  static async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const response = await fetch(`/api/db/messages?thread_id=${encodeURIComponent(threadId)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get messages');
    }

    const data = await response.json();
    return data.messages;
  }

  /**
   * Save a message
   */
  static async saveMessage(threadId: string, message: ChatMessage): Promise<void> {
    const response = await fetch('/api/db/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: threadId,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save message');
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, userData: { email?: string; username?: string; full_name?: string }): Promise<User> {
    const response = await fetch('/api/db/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        ...userData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    const data = await response.json();
    return data.user;
  }
}
