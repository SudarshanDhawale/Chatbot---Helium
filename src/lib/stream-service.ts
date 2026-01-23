/**
 * Service for handling streaming responses
 */

import type { StreamEvent } from '@/types/stream';

// Helper to get API key from localStorage
function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('helium_api_key');
}

// Helper to create headers with API key
function createHeaders(): HeadersInit {
  const apiKey = getApiKey();
  return apiKey ? { 'x-helium-api-key': apiKey } : {};
}

export class StreamService {
  /**
   * Stream task results using Server-Sent Events
   */
  static async streamTaskResults(
    threadId: string,
    projectId: string,
    options: {
      timeout?: number;
      includeFileContent?: boolean;
      onEvent: (event: StreamEvent) => void;
      onError?: (error: Error) => void;
      onComplete?: () => void;
    }
  ): Promise<() => void> {
    const params = new URLSearchParams({
      project_id: projectId,
      timeout: String(options.timeout || 300),
      include_file_content: String(options.includeFileContent || false),
    });

    let abortController: AbortController | null = new AbortController();

    const fetchStream = async () => {
      try {
        const response = await fetch(
          `/api/chat/${threadId}/stream?${params.toString()}`,
          {
            signal: abortController?.signal,
            headers: createHeaders(),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to start stream');
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Process any remaining buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const event: StreamEvent = JSON.parse(line.slice(6));
                    options.onEvent(event);
                  } catch (error) {
                    // Error parsing final SSE data - skip
                  }
                }
              }
            }
            options.onComplete?.();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
              // Empty line - separator between SSE events, skip
              continue;
            }
            
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const event: StreamEvent = JSON.parse(jsonStr);
                options.onEvent(event);

                // Don't stop reading - continue until stream is actually closed
                // The stream will close when Helium API closes the connection
              } catch (error) {
                // Error parsing SSE data - skip this line
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Stream was aborted, don't call onError
          return;
        }
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    };

    fetchStream();

    // Return abort function
    return () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    };
  }
}
