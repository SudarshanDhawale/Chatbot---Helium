/**
 * Types for chat UI components
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'completed' | 'error' | 'running' | 'stopped';
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
  files?: Array<{
    file_id: string;
    file_name: string;
    file_size: number;
    content?: string;
  }>;
  uploadedFiles?: Array<{
    file_id?: string; // Helium file ID (if available)
    name: string;
    type: string;
    size: number;
    url?: string; // Object URL for display (temporary, only during upload)
  }>; // Files uploaded by the user
  error?: string;
  toolExecutions?: Array<{
    function_name: string;
    description?: string;
    status: 'running' | 'completed' | 'failed';
  }>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  threadId: string | null;
  projectId: string | null;
  currentStatus: 'idle' | 'sending' | 'waiting' | 'completed' | 'error';
}
