/**
 * Helium API Client
 * Handles all communication with the Helium Public API
 */

import type {
  QuickActionRequest,
  QuickActionResponse,
  ThreadResponse,
  ContinueConversationRequest,
  ContinueConversationResponse,
  StopAgentResponse,
  ConversationHistory,
  ThreadFilesList,
  HeliumApiErrorResponse,
  TaskStatus,
} from '@/types/helium';

const BASE_URL = 'https://api.he2.ai/api/v1/public';

export class HeliumApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'HeliumApiError';
  }
}

export class HeliumClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || !apiKey.startsWith('he-')) {
      throw new Error('Invalid API key format. API key must start with "he-"');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData: HeliumApiErrorResponse = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new HeliumApiError(
          errorData.detail || `API request failed: ${response.statusText}`,
          response.status,
          errorData.detail
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HeliumApiError) {
        throw error;
      }
      throw new HeliumApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key === 'files' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('files', file);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }

  /**
   * Create and execute a new task
   */
  async createTask(request: QuickActionRequest): Promise<QuickActionResponse> {
    const formData = this.createFormData({
      prompt: request.prompt,
      agent_id: request.agent_id,
      model_name: request.model_name,
      enable_thinking: request.enable_thinking,
      reasoning_effort: request.reasoning_effort,
      enable_context_manager: request.enable_context_manager,
      source: request.source || 'web',
      metadata: request.metadata,
      show_in_recent_tasks: request.show_in_recent_tasks ?? true,
      files: request.files,
    });

    return this.request<QuickActionResponse>('/quick-action', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Get task results with polling
   */
  async getTaskResults(
    threadId: string,
    projectId: string,
    options: {
      timeout?: number;
      includeFileContent?: boolean;
      realtime?: boolean;
    } = {}
  ): Promise<ThreadResponse> {
    const params = new URLSearchParams({
      project_id: projectId,
      timeout: String(options.timeout || 300),
      include_file_content: String(options.includeFileContent || false),
      realtime: String(options.realtime || false),
    });

    return this.request<ThreadResponse>(
      `/threads/${threadId}/response?${params.toString()}`
    );
  }

  /**
   * Stream task results in real-time using Server-Sent Events
   */
  async streamTaskResults(
    threadId: string,
    projectId: string,
    options: {
      timeout?: number;
      includeFileContent?: boolean;
      onEvent?: (event: {
        type: 'status' | 'content' | 'code' | 'file' | 'error' | 'complete';
        status?: string;
        content?: string;
        code?: { language: string; code: string };
        file?: { file_id: string; file_name: string; file_size: number };
        error?: string;
      }) => void;
    } = {}
  ): Promise<void> {
    const params = new URLSearchParams({
      project_id: projectId,
      timeout: String(options.timeout || 300),
      include_file_content: String(options.includeFileContent || false),
      realtime: 'true',
    });

    const url = `${BASE_URL}/threads/${threadId}/response?${params.toString()}`;
    const headers = {
      'X-API-Key': this.apiKey,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new HeliumApiError(
          errorData.detail || `API request failed: ${response.statusText}`,
          response.status,
          errorData.detail
        );
      }

      if (!response.body) {
        throw new HeliumApiError('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (options.onEvent) {
                options.onEvent(data);
              }

              // Stop on completion or error
              if (data.type === 'complete' || data.type === 'error') {
                return;
              }
            } catch (error) {
              // Error parsing SSE data - skip this line
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof HeliumApiError) {
        throw error;
      }
      throw new HeliumApiError(
        `Stream error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Poll for task completion
   */
  async pollTaskResults(
    threadId: string,
    projectId: string,
    options: {
      maxWaitTime?: number;
      pollInterval?: number;
      onStatusUpdate?: (status: TaskStatus) => void;
    } = {}
  ): Promise<ThreadResponse> {
    const {
      maxWaitTime = 600000, // 10 minutes
      pollInterval = 2000, // 2 seconds
      onStatusUpdate,
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getTaskResults(threadId, projectId, {
        timeout: 30,
      });

      if (onStatusUpdate) {
        onStatusUpdate(result.status);
      }

      if (result.status === 'completed' || result.status === 'failed' || result.status === 'stopped') {
        return result;
      }

      if (result.status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      }

      return result;
    }

    // Timeout reached
    const finalResult = await this.getTaskResults(threadId, projectId, {
      timeout: 30,
    });
    return finalResult;
  }

  /**
   * Continue conversation with a follow-up message
   */
  async continueConversation(
    threadId: string,
    projectId: string,
    request: ContinueConversationRequest
  ): Promise<ContinueConversationResponse> {
    const formData = this.createFormData({
      prompt: request.prompt,
      files: request.files,
    });

    const params = new URLSearchParams({
      project_id: projectId,
    });

    return this.request<ContinueConversationResponse>(
      `/threads/${threadId}/response?${params.toString()}`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  /**
   * Stop a running task
   */
  async stopTask(
    threadId: string,
    projectId: string
  ): Promise<StopAgentResponse> {
    const params = new URLSearchParams({
      project_id: projectId,
    });

    return this.request<StopAgentResponse>(
      `/threads/${threadId}/agent/stop?${params.toString()}`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    threadId: string,
    projectId: string,
    options: {
      page?: number;
      pageSize?: number;
      includeFileContent?: boolean;
      includeStatusMessages?: boolean;
      compact?: boolean;
    } = {}
  ): Promise<ConversationHistory> {
    const params = new URLSearchParams({
      project_id: projectId,
      page: String(options.page || 1),
      page_size: String(options.pageSize || 100),
      include_file_content: String(options.includeFileContent || false),
      include_status_messages: String(options.includeStatusMessages || false),
      compact: String(options.compact || false),
    });

    return this.request<ConversationHistory>(
      `/threads/${threadId}/history?${params.toString()}`
    );
  }

  /**
   * Get list of files in a thread
   */
  async getThreadFiles(
    threadId: string,
    projectId: string
  ): Promise<ThreadFilesList> {
    const params = new URLSearchParams({
      project_id: projectId,
    });

    return this.request<ThreadFilesList>(
      `/threads/${threadId}/files?${params.toString()}`
    );
  }

  /**
   * Download a specific file
   */
  async getFile(
    fileId: string,
    threadId: string,
    projectId: string,
    download: boolean = true
  ): Promise<Blob> {
    const params = new URLSearchParams({
      project_id: projectId,
      thread_id: threadId,
      download: String(download),
    });

    const url = `${BASE_URL}/files/${encodeURIComponent(fileId)}?${params.toString()}`;
    const headers = {
      'X-API-Key': this.apiKey,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData: HeliumApiErrorResponse = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new HeliumApiError(
          errorData.detail || `API request failed: ${response.statusText}`,
          response.status,
          errorData.detail
        );
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof HeliumApiError) {
        throw error;
      }
      throw new HeliumApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
