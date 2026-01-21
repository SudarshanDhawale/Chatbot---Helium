/**
 * Types for streaming responses
 */

export type StreamEventType =
  | 'status'
  | 'content'
  | 'code'
  | 'file'
  | 'tool'
  | 'error'
  | 'complete'
  | 'assistant'; // passthrough for Helium assistant chunks

export interface StreamEvent {
  type: StreamEventType;
  status?: string;
  content?: string;
  // Helium-specific fields (pass-through)
  metadata?: any;
  sequence?: number;
  message_id?: string | null;
  thread_id?: string;
  is_llm_message?: boolean;
  code?: {
    language: string;
    code: string;
  };
  file?: {
    file_id: string;
    file_name: string;
    file_size: number;
  };
  tool?: {
    tool_execution?: {
      function_name?: string;
      result?: any;
      arguments?: any;
    };
  };
  error?: string;
}
