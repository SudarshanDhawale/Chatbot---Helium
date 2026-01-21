/**
 * Service for handling streaming responses
 */

import type { StreamEvent } from '@/types/stream';

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
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to start stream');
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        console.log('Stream started, reading response...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream ended');
            // Process any remaining buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const event: StreamEvent = JSON.parse(line.slice(6));
                    options.onEvent(event);
                  } catch (error) {
                    console.error('Error parsing final SSE data:', error, line);
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
                console.log('Received SSE event:', event.type, event);
                options.onEvent(event);

                // Don't stop reading - continue until stream is actually closed
                // The stream will close when Helium API closes the connection
              } catch (error) {
                console.error('Error parsing SSE data:', error, 'Line:', trimmedLine);
              }
            } else {
              // Log non-data lines for debugging
              console.log('Non-data SSE line:', trimmedLine);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Stream was aborted, don't call onError
          console.log('Stream aborted');
          return;
        }
        console.error('Stream error:', error);
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
