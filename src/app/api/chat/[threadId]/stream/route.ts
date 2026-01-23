/**
 * API Route for streaming task results (Server-Sent Events)
 * Proxies the Helium API SSE stream to the client
 */

import { NextRequest } from 'next/server';
import { getErrorMessage } from '@/utils/errors';

const BASE_URL = 'https://api.he2.ai/api/v1/public';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  
  try {
    // Try to get API key from header first, fallback to environment variable
    const apiKey = request.headers.get('x-helium-api-key') || process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required. Please provide your Helium API key.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const timeout = searchParams.get('timeout');
    const includeFileContent = searchParams.get('include_file_content') === 'true';

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'project_id is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build Helium API URL
    const params = new URLSearchParams({
      project_id: projectId,
      timeout: timeout || '300',
      include_file_content: String(includeFileContent),
      realtime: 'true',
    });

    const heliumUrl = `${BASE_URL}/threads/${threadId}/response?${params.toString()}`;

    // Fetch from Helium API and proxy the stream
    const response = await fetch(heliumUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return new Response(
        JSON.stringify({ error: errorData.detail || 'Failed to start stream' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({ error: 'Response body is null' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a transform stream to proxy the SSE events
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        let closed = false;

        // Helper function to safely enqueue data
        const safeEnqueue = (data: Uint8Array) => {
          if (closed) return false;
          try {
            controller.enqueue(data);
            return true;
          } catch (error: any) {
            // Handle "Controller is already closed" error gracefully
            if (error?.message?.includes('closed') || error?.name === 'InvalidStateError') {
              closed = true;
              return false;
            }
            throw error;
          }
        };

        // Helper function to safely close the controller
        const safeClose = () => {
          if (closed) return;
          try {
            controller.close();
            closed = true;
          } catch (error: any) {
            // Ignore errors when closing an already-closed controller
            closed = true;
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Process any remaining buffer
              if (buffer.trim() && !closed) {
                const remainingLines = buffer.split('\n');
                for (const line of remainingLines) {
                  if (line.trim()) {
                    safeEnqueue(encoder.encode(`${line}\n\n`));
                  } else if (line === '') {
                    safeEnqueue(encoder.encode('\n'));
                  }
                }
              }
              // Send completion event
              if (!closed) {
                safeEnqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`)
                );
                safeClose();
              }
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              // Forward all lines including empty ones (SSE format requires them)
              // Ensure each SSE event ends with a double newline so clients flush
              if (line.trim()) {
                // Non-empty line - forward and terminate the event block
                safeEnqueue(encoder.encode(`${line}\n\n`));
              } else if (line === '') {
                // Explicit empty line separator
                safeEnqueue(encoder.encode('\n'));
              }
            }
          }
        } catch (error) {
          const errorEvent = {
            type: 'error' as const,
            error: getErrorMessage(error),
          };
          if (!closed) {
            safeEnqueue(
              encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
            );
            safeClose();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: error instanceof Error && 'status' in error ? (error as any).status : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
