/**
 * Browser localStorage-based storage service
 * Replaces PostgreSQL for temporary testing
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

interface StorageData {
  users: Record<string, User>;
  threads: Record<string, Thread>;
  messages: Record<string, ChatMessage[]>; // key: threadId
}

const STORAGE_KEY = 'helium_app_data';

class StorageClient {
  private getData(): StorageData {
    if (typeof window === 'undefined') {
      return { users: {}, threads: {}, messages: {} };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { users: {}, threads: {}, messages: {} };
      }
      return JSON.parse(data);
    } catch (error) {
      return { users: {}, threads: {}, messages: {} };
    }
  }

  private saveData(data: StorageData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Get or create a user
   */
  async getOrCreateUser(email: string, userData?: { username?: string; full_name?: string }): Promise<User> {
    const data = this.getData();
    
    // Find existing user by email
    const existingUser = Object.values(data.users).find(u => u.email === email);
    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      username: userData?.username,
      full_name: userData?.full_name,
    };

    data.users[newUser.id] = newUser;
    this.saveData(data);
    
    return newUser;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const data = this.getData();
    const user = Object.values(data.users).find(u => u.email === email);
    return user || null;
  }

  /**
   * Get all threads for a user
   */
  async getUserThreads(userId: string): Promise<Thread[]> {
    const data = this.getData();
    const threads = Object.values(data.threads)
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    
    return threads;
  }

  /**
   * Create a new thread
   */
  async createThread(
    userId: string,
    threadId: string,
    projectId: string,
    title: string
  ): Promise<Thread> {
    const data = this.getData();
    
    const now = new Date().toISOString();
    const newThread: Thread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      thread_id: threadId,
      project_id: projectId,
      title,
      created_at: now,
      updated_at: now,
      last_message_at: now,
      message_count: 0,
      is_archived: false,
    };

    data.threads[newThread.id] = newThread;
    this.saveData(data);
    
    return newThread;
  }

  /**
   * Get messages for a thread
   */
  async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const data = this.getData();
    const messages = data.messages[threadId] || [];
    
    // Convert timestamp strings back to Date objects
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }

  /**
   * Save a message
   */
  async saveMessage(threadId: string, message: ChatMessage): Promise<void> {
    const data = this.getData();
    
    // Initialize messages array for thread if it doesn't exist
    if (!data.messages[threadId]) {
      data.messages[threadId] = [];
    }

    // Check if message already exists (by id)
    const existingIndex = data.messages[threadId].findIndex(m => m.id === message.id);
    if (existingIndex >= 0) {
      // Update existing message
      data.messages[threadId][existingIndex] = message;
    } else {
      // Add new message
      data.messages[threadId].push(message);
    }

    // Update thread's last_message_at and message_count
    const thread = Object.values(data.threads).find(t => t.thread_id === threadId);
    if (thread) {
      thread.last_message_at = new Date().toISOString();
      thread.message_count = data.messages[threadId].length;
      thread.updated_at = new Date().toISOString();
    }

    this.saveData(data);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, userData: { email?: string; username?: string; full_name?: string }): Promise<User> {
    const data = this.getData();
    
    const user = data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    // Update user data
    if (userData.email) user.email = userData.email;
    if (userData.username !== undefined) user.username = userData.username;
    if (userData.full_name !== undefined) user.full_name = userData.full_name;

    data.users[userId] = user;
    this.saveData(data);
    
    return user;
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string): Promise<void> {
    const data = this.getData();
    
    // Find and delete the thread
    const threadKey = Object.keys(data.threads).find(key => data.threads[key].thread_id === threadId);
    if (threadKey) {
      delete data.threads[threadKey];
    }

    // Delete associated messages
    delete data.messages[threadId];

    this.saveData(data);
  }

  /**
   * Clear all data (useful for testing)
   */
  async clearAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export singleton instance
export const StorageService = new StorageClient();
