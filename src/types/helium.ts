/**
 * TypeScript types for Helium Public API
 */

export type TaskStatus = 'completed' | 'running' | 'failed' | 'stopped' | 'no_run';

export type ReasoningEffort = 'low' | 'medium' | 'high';

export type Source = 'web' | 'mobile' | 'widget';

export interface QuickActionRequest {
  prompt?: string;
  agent_id?: string;
  model_name?: string;
  enable_thinking?: boolean;
  reasoning_effort?: ReasoningEffort;
  enable_context_manager?: boolean;
  source?: Source;
  metadata?: string;
  show_in_recent_tasks?: boolean;
  files?: File[];
}

export interface QuickActionResponse {
  success: boolean;
  project_id: string;
  thread_id: string;
  agent_run_id: string;
  message: string;
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface ThreadFile {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  included_inline?: boolean;
  content?: string;
  encoding?: string;
}

export interface MessageResponse {
  role: 'user' | 'assistant';
  content: string;
  message_id: string;
}

export interface ThreadResponse {
  success: boolean;
  thread_id: string;
  project_id: string;
  agent_run_id: string;
  status: TaskStatus;
  response?: MessageResponse;
  has_code?: boolean;
  has_files?: boolean;
  code_blocks?: CodeBlock[];
  files?: ThreadFile[];
}

export interface ContinueConversationRequest {
  prompt?: string;
  files?: File[];
}

export interface ContinueConversationResponse {
  success: boolean;
  agent_run_id: string;
  status: TaskStatus;
  message: string;
}

export interface StopAgentResponse {
  success: boolean;
  agent_run_id: string;
  status: 'stopped';
}

export interface HistoryMessage {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  has_code?: boolean;
  has_files?: boolean;
}

export interface ConversationHistory {
  success: boolean;
  thread_id: string;
  messages: HistoryMessage[];
  pagination: {
    current_page: number;
    total_pages: number;
    has_next: boolean;
  };
}

export interface ThreadFilesList {
  success: boolean;
  files: ThreadFile[];
  pagination: {
    current_page: number;
    total_items: number;
  };
}

export interface HeliumApiErrorResponse {
  detail: string;
  status?: number;
}
