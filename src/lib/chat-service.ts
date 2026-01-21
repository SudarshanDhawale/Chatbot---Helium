/**
 * Chat service for handling API calls and state management
 */

import type { ChatMessage } from '@/types/chat';
import type { ThreadResponse } from '@/types/helium';

export class ChatService {
  /**
   * Create a new chat task
   */
  static async createTask(
    prompt: string,
    files?: File[]
  ): Promise<{
    threadId: string;
    projectId: string;
    agentRunId: string;
  }> {
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }

    return await response.json();
  }

  /**
   * Get task results with polling
   */
  static async getTaskResults(
    threadId: string,
    projectId: string,
    options: {
      timeout?: number;
      includeFileContent?: boolean;
    } = {}
  ): Promise<ThreadResponse> {
    const params = new URLSearchParams({
      project_id: projectId,
      timeout: String(options.timeout || 300),
      include_file_content: String(options.includeFileContent || false),
    });

    const response = await fetch(
      `/api/chat/${threadId}/response?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get task results');
    }

    return await response.json();
  }

  /**
   * Continue conversation
   */
  static async continueConversation(
    threadId: string,
    projectId: string,
    prompt: string,
    files?: File[]
  ): Promise<{ agentRunId: string; status: string }> {
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(
      `/api/chat/${threadId}/continue?project_id=${projectId}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to continue conversation');
    }

    return await response.json();
  }

  /**
   * Stop a running task
   */
  static async stopTask(
    threadId: string,
    projectId: string
  ): Promise<void> {
    const response = await fetch(
      `/api/chat/${threadId}/stop?project_id=${projectId}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to stop task');
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(
    threadId: string,
    projectId: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{
    success: boolean;
    thread_id: string;
    messages: Array<{
      message_id: string;
      role: 'user' | 'assistant';
      content: string;
      created_at: string;
    }>;
  }> {
    const params = new URLSearchParams({
      project_id: projectId,
      page: String(options.page || 1),
      page_size: String(options.pageSize || 100),
    });

    const response = await fetch(
      `/api/chat/${threadId}/history?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get conversation history');
    }

    return await response.json();
  }

  /**
   * Convert API response to chat message
   */
  static convertResponseToMessage(
    response: ThreadResponse,
    isUser: boolean = false
  ): Partial<ChatMessage> {
    return {
      role: isUser ? 'user' : 'assistant',
      content: response.response?.content || '',
      status: response.status === 'completed' ? 'completed' : 'running',
      codeBlocks: response.code_blocks?.map((block) => ({
        language: block.language,
        code: block.code,
      })),
      files: response.files?.map((file) => ({
        file_id: file.file_id,
        file_name: file.file_name,
        file_size: file.file_size,
        content: file.content,
      })),
    };
  }
}
