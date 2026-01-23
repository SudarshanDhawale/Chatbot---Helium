/**
 * Database service for managing users, threads, and messages
 */

import { query, getClient } from './db';
import type { ChatMessage } from '@/types/chat';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface Thread {
  id: string;
  user_id: string;
  thread_id: string;
  project_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  last_message_at: Date;
  message_count: number;
  is_archived: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  message_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: 'sending' | 'running' | 'completed' | 'error' | 'stopped';
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export class DatabaseService {
  /**
   * Get or create a user by email
   */
  static async getOrCreateUser(email: string, userData?: Partial<User>): Promise<User> {
    // First, try to get existing user
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // User exists, update last_login and return
      const result = await query(
        `UPDATE users 
         SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE email = $1
         RETURNING *`,
        [email]
      );
      return result.rows[0];
    }

    // User doesn't exist, create new one
    const result = await query(
      `INSERT INTO users (email, username, full_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, userData?.username, userData?.full_name, userData?.avatar_url]
    );
    return result.rows[0];
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
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
    const result = await query(
      `INSERT INTO threads (user_id, thread_id, project_id, title, message_count)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [userId, threadId, projectId, title]
    );
    return result.rows[0];
  }

  /**
   * Get thread by Helium thread_id
   */
  static async getThreadByThreadId(threadId: string): Promise<Thread | null> {
    const result = await query('SELECT * FROM threads WHERE thread_id = $1', [threadId]);
    return result.rows[0] || null;
  }

  /**
   * Get all threads for a user
   */
  static async getUserThreads(userId: string, includeArchived = false): Promise<Thread[]> {
    const whereClause = includeArchived
      ? 'WHERE user_id = $1'
      : 'WHERE user_id = $1 AND is_archived = false';
    
    const result = await query(
      `SELECT * FROM threads ${whereClause} ORDER BY last_message_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Update thread
   */
  static async updateThread(
    threadId: string,
    updates: { title?: string; last_message_at?: Date; message_count?: number }
  ): Promise<Thread> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.last_message_at !== undefined) {
      setClauses.push(`last_message_at = $${paramIndex++}`);
      values.push(updates.last_message_at);
    }
    if (updates.message_count !== undefined) {
      setClauses.push(`message_count = $${paramIndex++}`);
      values.push(updates.message_count);
    }

    values.push(threadId);

    const result = await query(
      `UPDATE threads SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE thread_id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Save a message with all related data (files, code blocks, tool executions)
   */
  static async saveMessage(
    threadId: string,
    message: ChatMessage
  ): Promise<Message> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get thread UUID
      const threadResult = await client.query(
        'SELECT id FROM threads WHERE thread_id = $1',
        [threadId]
      );
      
      if (threadResult.rows.length === 0) {
        console.error('Thread not found in database:', threadId);
        throw new Error(`Thread not found: ${threadId}`);
      }
      
      const threadUuid = threadResult.rows[0].id;

      // Insert message
      const messageResult = await client.query(
        `INSERT INTO messages (thread_id, message_id, role, content, status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          threadUuid,
          message.id,
          message.role,
          message.content,
          message.status || 'completed',
          message.error,
        ]
      );

      const savedMessage = messageResult.rows[0];
      const messageUuid = savedMessage.id;

      // Save files if any
      if (message.files && message.files.length > 0) {
        for (const file of message.files) {
          await client.query(
            `INSERT INTO files (message_id, file_id, file_name, file_size, is_uploaded)
             VALUES ($1, $2, $3, $4, $5)`,
            [messageUuid, file.file_id, file.file_name, file.file_size, false]
          );
        }
      }

      // Save uploaded files if any
      if (message.uploadedFiles && message.uploadedFiles.length > 0) {
        for (const file of message.uploadedFiles) {
          // For uploaded files, we store the file_id if available (from Helium)
          // Otherwise, we just store metadata without a permanent URL
          await client.query(
            `INSERT INTO files (message_id, file_id, file_name, file_size, file_type, is_uploaded)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [messageUuid, file.file_id || null, file.name, file.size, file.type, true]
          );
        }
      }

      // Save code blocks if any
      if (message.codeBlocks && message.codeBlocks.length > 0) {
        for (const block of message.codeBlocks) {
          await client.query(
            `INSERT INTO code_blocks (message_id, language, code)
             VALUES ($1, $2, $3)`,
            [messageUuid, block.language, block.code]
          );
        }
      }

      // Save tool executions if any
      if (message.toolExecutions && message.toolExecutions.length > 0) {
        for (const tool of message.toolExecutions) {
          await client.query(
            `INSERT INTO tool_executions (message_id, function_name, description, status)
             VALUES ($1, $2, $3, $4)`,
            [messageUuid, tool.function_name, tool.description, tool.status]
          );
        }
      }

      // Update thread message count and last_message_at
      await client.query(
        `UPDATE threads 
         SET message_count = message_count + 1,
             last_message_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [threadUuid]
      );

      await client.query('COMMIT');
      return savedMessage;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error in saveMessage, rolling back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get messages for a thread
   */
  static async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const result = await query(
      `SELECT 
        m.*,
        json_agg(DISTINCT jsonb_build_object(
          'file_id', f.file_id,
          'file_name', f.file_name,
          'file_size', f.file_size
        )) FILTER (WHERE f.id IS NOT NULL AND f.is_uploaded = false) as files,
        json_agg(DISTINCT jsonb_build_object(
          'file_id', uf.file_id,
          'name', uf.file_name,
          'type', uf.file_type,
          'size', uf.file_size
        )) FILTER (WHERE uf.id IS NOT NULL AND uf.is_uploaded = true) as uploaded_files,
        json_agg(DISTINCT jsonb_build_object(
          'language', cb.language,
          'code', cb.code
        )) FILTER (WHERE cb.id IS NOT NULL) as code_blocks,
        json_agg(DISTINCT jsonb_build_object(
          'function_name', te.function_name,
          'description', te.description,
          'status', te.status
        )) FILTER (WHERE te.id IS NOT NULL) as tool_executions
       FROM messages m
       LEFT JOIN threads t ON m.thread_id = t.id
       LEFT JOIN files f ON m.id = f.message_id AND f.is_uploaded = false
       LEFT JOIN files uf ON m.id = uf.message_id AND uf.is_uploaded = true
       LEFT JOIN code_blocks cb ON m.id = cb.message_id
       LEFT JOIN tool_executions te ON m.id = te.message_id
       WHERE t.thread_id = $1
       GROUP BY m.id
       ORDER BY m.created_at ASC`,
      [threadId]
    );
    
    return result.rows.map((row) => {
      const timestamp = new Date(row.created_at);
      
      return {
        id: row.message_id || row.id,
        role: row.role,
        content: row.content,
        status: row.status,
        error: row.error_message,
        timestamp: timestamp,
        files: row.files && row.files[0] ? row.files : undefined,
        uploadedFiles: row.uploaded_files && row.uploaded_files[0] ? row.uploaded_files : undefined,
        codeBlocks: row.code_blocks && row.code_blocks[0] ? row.code_blocks : undefined,
        toolExecutions: row.tool_executions && row.tool_executions[0] ? row.tool_executions : undefined,
      };
    });
  }

  /**
   * Delete a thread and all its messages
   */
  static async deleteThread(threadId: string): Promise<void> {
    await query('DELETE FROM threads WHERE thread_id = $1', [threadId]);
  }

  /**
   * Archive a thread
   */
  static async archiveThread(threadId: string): Promise<void> {
    await query(
      'UPDATE threads SET is_archived = true, updated_at = CURRENT_TIMESTAMP WHERE thread_id = $1',
      [threadId]
    );
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: { email?: string; username?: string; full_name?: string }): Promise<User> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.username !== undefined) {
      setClauses.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }
    if (updates.full_name !== undefined) {
      setClauses.push(`full_name = $${paramIndex++}`);
      values.push(updates.full_name);
    }

    if (setClauses.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  }
}
