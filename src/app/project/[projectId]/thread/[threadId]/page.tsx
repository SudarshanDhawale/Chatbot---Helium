/**
 * Thread page - displays a specific conversation
 * URL: /project/[projectId]/thread/[threadId]
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { FileModal } from '@/components/files/FileModal';
import { ProfileModal } from '@/components/user/ProfileModal';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useChat } from '@/hooks/use-chat';
import { ChatService } from '@/lib/chat-service';
import { StreamService } from '@/lib/stream-service';
import { DBClient } from '@/lib/db-client';
import type { ChatMessage } from '@/types/chat';
import type { ThreadSummary } from '@/types/thread';
import type { StreamEvent } from '@/types/stream';

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const threadId = params.threadId as string;
  const isNewThread = searchParams.get('new') === 'true';

  const {
    state,
    addMessage,
    updateMessage,
    setMessages,
    setLoading,
    setThreadInfo,
    handleError,
    updateStatus,
    stop,
    reset,
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Use refs to track streaming state
  const streamAbortRef = useRef<(() => void) | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const accumulatedContentRef = useRef<string>('');
  const codeBlocksRef = useRef<Array<{ language: string; code: string }>>([]);
  const filesRef = useRef<Array<{ file_id: string; file_name: string; file_size: number }>>([]);
  const toolExecutionsRef = useRef<Array<{ function_name: string; description?: string; status: 'running' | 'completed' | 'failed' }>>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username?: string; full_name?: string } | null>(null);

  // Function to load threads from database
  const loadThreads = useCallback(async (userId: string) => {
    try {
      const dbThreads = await DBClient.getUserThreads(userId);
      const threadSummaries: ThreadSummary[] = dbThreads.map(thread => ({
        threadId: thread.thread_id,
        projectId: thread.project_id,
        title: thread.title,
        lastMessage: '',
        lastUpdated: new Date(thread.last_message_at),
        messageCount: thread.message_count,
      }));
      setThreads(threadSummaries);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  }, []);

  // Initialize user and load thread
  useEffect(() => {
    const initializeThread = async () => {
      try {
        // Get or create user
        const defaultEmail = 'smdhawale77@gmail.com';
        const user = await DBClient.getOrCreateUser(defaultEmail);
        setCurrentUser(user);

        // Set thread info immediately
        setThreadInfo(threadId, projectId);

        // Load threads from database
        const dbThreads = await DBClient.getUserThreads(user.id);
        const threadSummaries: ThreadSummary[] = dbThreads.map(thread => ({
          threadId: thread.thread_id,
          projectId: thread.project_id,
          title: thread.title,
          lastMessage: '',
          lastUpdated: new Date(thread.last_message_at),
          messageCount: thread.message_count,
        }));
        setThreads(threadSummaries);

        // Find the current thread
        const currentThread = dbThreads.find(t => t.thread_id === threadId && t.project_id === projectId);
        if (currentThread) {
          // Always load messages from database (including for new threads)
          // Load messages from database
          console.log('Loading messages for thread:', threadId);
          const dbMessages = await DBClient.getThreadMessages(threadId);
          console.log('Loaded messages from database:', dbMessages.length, 'messages');
          console.log('Message roles:', dbMessages.map(m => m.role));
          console.log('Message contents:', dbMessages.map(m => ({ role: m.role, content: m.content?.substring(0, 50) })));
          
          if (dbMessages.length > 0) {
            setMessages(dbMessages);
            console.log('Set messages in state');
          } else if (!isNewThread) {
            // Only fallback to API if this is NOT a new thread
            // (new threads won't have messages in Helium API yet)
            const history = await ChatService.getConversationHistory(threadId, projectId);
            const messages: ChatMessage[] = history.messages.map((msg) => ({
              id: msg.message_id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              status: 'completed' as const,
            }));
            setMessages(messages);
          }
        } else {
          // Thread not found, redirect to home
          console.warn('Thread not found, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Error initializing thread:', error);
        handleError(error);
      }
    };

    if (threadId && projectId) {
      initializeThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, projectId]); // Only depend on threadId and projectId

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  const stopStreaming = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current();
      streamAbortRef.current = null;
    }
    streamingMessageIdRef.current = null;
    accumulatedContentRef.current = '';
    codeBlocksRef.current = [];
    filesRef.current = [];
    toolExecutionsRef.current = [];
  }, []);

  /**
   * Start streaming task results in real-time
   */
  const startStreaming = useCallback(
    (threadId: string, projectId: string, messageId: string) => {
      // Stop any existing streaming
      stopStreaming();

      // Validate before starting
      if (!threadId || !projectId || threadId === 'undefined' || projectId === 'undefined') {
        console.error('Cannot start streaming: Invalid threadId or projectId', {
          threadId,
          projectId,
        });
        updateMessage(messageId, {
          status: 'error',
          error: 'Invalid thread or project ID',
        });
        updateStatus('error');
        setLoading(false);
        return;
      }

      // Reset accumulated data
      streamingMessageIdRef.current = messageId;
      accumulatedContentRef.current = '';
      codeBlocksRef.current = [];
      filesRef.current = [];
      toolExecutionsRef.current = [];

      // Start streaming
      StreamService.streamTaskResults(
        threadId,
        projectId,
        {
          timeout: 300,
          includeFileContent: true,
          onEvent: (event: StreamEvent) => {
            console.log('Received stream event:', event.type, event);
            if (!streamingMessageIdRef.current) {
              console.warn('No streaming message ID, ignoring event');
              return;
            }

            switch (event.type) {
              case 'assistant': {
                // Helium sends assistant chunks (sequence) and a final complete message.
                // Avoid duplicating content by not re-appending the final full message.
                const rawMetadata = (event as any).metadata;
                let streamStatus: string | undefined;
                let isAck = false;
                if (typeof rawMetadata === 'string') {
                  try {
                    const parsedMeta = JSON.parse(rawMetadata);
                    streamStatus = parsedMeta?.stream_status;
                    isAck = parsedMeta?.is_acknowledgment === true;
                  } catch {
                    streamStatus = undefined;
                    isAck = false;
                  }
                } else if (rawMetadata && typeof rawMetadata === 'object') {
                  streamStatus = rawMetadata.stream_status;
                  isAck = rawMetadata.is_acknowledgment === true;
                }

                // Skip acknowledgment-only events to avoid duplicate leading text
                if (isAck) break;

                const isComplete = streamStatus === 'complete';

                // Helium sends JSON in content; parse to extract text
                let textChunk = '';
                if (event.content) {
                  try {
                    const parsed = JSON.parse(event.content);
                    if (parsed?.content) {
                      textChunk = parsed.content;
                    }
                    // If parsed successfully but no content field, it's likely tool execution JSON - skip it
                  } catch {
                    // If it's not valid JSON, check if it looks like JSON (starts with { or [)
                    // If so, skip it to avoid showing weird text
                    const trimmed = event.content.trim();
                    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                      textChunk = event.content;
                    }
                    // Otherwise skip this content as it's likely malformed JSON
                  }
                }

                // Append only chunked pieces; skip appending the final complete payload
                const shouldAppend =
                  textChunk &&
                  textChunk.length > 0 &&
                  !(isComplete && accumulatedContentRef.current.length > 0);

                if (shouldAppend) {
                  accumulatedContentRef.current += textChunk;
                  updateMessage(streamingMessageIdRef.current, {
                    content: accumulatedContentRef.current,
                    codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                    files: filesRef.current.length > 0 ? filesRef.current : undefined,
                    toolExecutions: toolExecutionsRef.current.length > 0 ? [...toolExecutionsRef.current] : undefined,
                  });
                }

                if (isComplete) {
                  // Don't set status to completed here - wait for the final 'complete' event
                  // Just update the content one last time
                  updateMessage(streamingMessageIdRef.current, {
                    content: accumulatedContentRef.current || textChunk,
                    codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                    files: filesRef.current.length > 0 ? filesRef.current : undefined,
                    toolExecutions: toolExecutionsRef.current.length > 0 ? [...toolExecutionsRef.current] : undefined,
                  });
                  // Don't stop streaming here - let it continue until Helium API closes the connection
                }
                break;
              }

              case 'status':
                if (event.status === 'running') {
                  updateStatus('waiting');
                  updateMessage(streamingMessageIdRef.current, {
                    status: 'running',
                  });
                } else if (event.status === 'completed') {
                  updateStatus('completed');
                  setLoading(false);
                  updateMessage(streamingMessageIdRef.current, {
                    status: 'completed',
                    content: accumulatedContentRef.current,
                    codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                    files: filesRef.current.length > 0 ? filesRef.current : undefined,
                  });
                  // Don't stop streaming here - let it continue until Helium API closes the connection
                } else if (event.status === 'failed' || event.status === 'stopped') {
                  updateStatus('error');
                  setLoading(false);
                  updateMessage(streamingMessageIdRef.current, {
                    status: 'error',
                    error: event.status === 'failed' ? 'Task failed' : 'Task stopped',
                  });
                  stopStreaming();
                }
                break;

              case 'content':
                if (event.content) {
                  accumulatedContentRef.current += event.content;
                  updateMessage(streamingMessageIdRef.current, {
                    content: accumulatedContentRef.current,
                    codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                    files: filesRef.current.length > 0 ? filesRef.current : undefined,
                  });
                }
                break;

              case 'code':
                if (event.code) {
                  // Check if code block already exists for this language
                  const existingIndex = codeBlocksRef.current.findIndex(
                    (block) => block.language === event.code!.language
                  );
                  if (existingIndex >= 0) {
                    // Append to existing code block
                    codeBlocksRef.current[existingIndex].code += event.code.code;
                  } else {
                    // Create new code block
                    codeBlocksRef.current.push({
                      language: event.code.language,
                      code: event.code.code,
                    });
                  }
                  updateMessage(streamingMessageIdRef.current, {
                    content: accumulatedContentRef.current,
                    codeBlocks: [...codeBlocksRef.current],
                    files: filesRef.current.length > 0 ? filesRef.current : undefined,
                  });
                }
                break;

              case 'file':
                if (event.file) {
                  console.log('File event received:', event.file);
                  // Check if file already exists
                  const exists = filesRef.current.some(f => f.file_id === event.file!.file_id);
                  if (!exists) {
                    console.log('Adding new file:', event.file.file_name);
                    filesRef.current.push(event.file);
                    updateMessage(streamingMessageIdRef.current, {
                      content: accumulatedContentRef.current,
                      codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                      files: filesRef.current.length > 0 ? [...filesRef.current] : undefined,
                    });
                  } else {
                    console.log('File already exists:', event.file.file_name);
                  }
                }
                break;

              case 'tool':
                // Track tool executions and extract files
                if (event.tool?.tool_execution) {
                  const toolExec = event.tool.tool_execution;
                  const functionName = toolExec.function_name || 'unknown_tool';
                  
                  // Helper to format tool name into readable description
                  const formatToolDescription = (name: string, args?: any): string => {
                    const toolNameMap: Record<string, string> = {
                      'create_file': 'Creating file',
                      'execute_command': 'Running command',
                      'generate_image': 'Generating image',
                      'search_web': 'Searching web',
                      'read_file': 'Reading file',
                      'write_file': 'Writing file',
                    };
                    
                    // Try to get a friendly name
                    let displayName = toolNameMap[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    // Add context if available
                    if (args) {
                      if (name === 'create_file' && args.file_path) {
                        const fileName = args.file_path.split('/').pop() || args.file_path;
                        displayName = `Creating ${fileName}`;
                      } else if (name === 'execute_command' && args.command) {
                        const cmd = args.command.split(' ')[0];
                        displayName = `Running ${cmd}`;
                      } else if (name === 'generate_image' || name === 'create_image') {
                        displayName = 'Generating image';
                      }
                    }
                    
                    return displayName;
                  };
                  
                  // Check if tool has a result (completed) or is starting (no result yet)
                  const hasResult = toolExec.result !== undefined && toolExec.result !== null;
                  
                  if (!hasResult) {
                    // Tool is starting - add to active executions
                    const existingIndex = toolExecutionsRef.current.findIndex(
                      t => t.function_name === functionName
                    );
                    
                    if (existingIndex === -1) {
                      const description = formatToolDescription(functionName, toolExec.arguments);
                      toolExecutionsRef.current.push({
                        function_name: functionName,
                        description,
                        status: 'running',
                      });
                      
                      updateMessage(streamingMessageIdRef.current, {
                        content: accumulatedContentRef.current,
                        codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                        files: filesRef.current.length > 0 ? filesRef.current : undefined,
                        toolExecutions: [...toolExecutionsRef.current],
                      });
                    }
                  } else {
                    // Tool completed - mark as completed
                    const existingIndex = toolExecutionsRef.current.findIndex(
                      t => t.function_name === functionName
                    );
                    
                    if (existingIndex >= 0) {
                      toolExecutionsRef.current[existingIndex].status = 'completed';
                    }
                    
                    // Extract files from tool results
                    console.log('Processing tool result:', functionName, toolExec.result);
                    if ((functionName === 'create_file' || functionName === 'generate_image' || functionName.includes('image')) && toolExec.result) {
                      try {
                        const result = typeof toolExec.result === 'string'
                          ? JSON.parse(toolExec.result)
                          : toolExec.result;

                        console.log('Parsed tool result:', result);

                        // If result contains file information
                        if (result.file_id || result.file_path || result.image_url || result.image_path) {
                          const fileName = toolExec.arguments?.file_path || result.file_path || result.image_path || result.file_name || `generated_${functionName}_${Date.now()}`;
                          const fileId = result.file_id || result.image_id || `${threadId}:/workspace/${fileName}`;
                          const fileSize = result.file_size || result.image_size || 0;

                          const fileInfo = {
                            file_id: fileId,
                            file_name: fileName,
                            file_size: fileSize,
                          };

                          console.log('Extracted file info:', fileInfo);

                          // Check if file already exists
                          const exists = filesRef.current.some(f => f.file_id === fileInfo.file_id);
                          if (!exists) {
                            console.log('Adding file to filesRef:', fileInfo);
                            filesRef.current.push(fileInfo);
                            // Update message immediately when file is added
                            updateMessage(streamingMessageIdRef.current, {
                              content: accumulatedContentRef.current,
                              codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                              files: filesRef.current.length > 0 ? [...filesRef.current] : undefined,
                            });
                          } else {
                            console.log('File already exists, skipping:', fileInfo.file_name);
                          }
                        } else {
                          console.log('No file information found in result');
                        }
                      } catch (e) {
                        console.error('Error parsing tool result:', e);
                      }
                    }
                    
                    updateMessage(streamingMessageIdRef.current, {
                      content: accumulatedContentRef.current,
                      codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                      files: filesRef.current.length > 0 ? filesRef.current : undefined,
                      toolExecutions: [...toolExecutionsRef.current],
                    });
                  }
                }
                break;

              case 'error':
                updateStatus('error');
                setLoading(false);
                updateMessage(streamingMessageIdRef.current, {
                  status: 'error',
                  error: event.error || 'Stream error occurred',
                });
                stopStreaming();
                break;

              case 'complete':
                updateStatus('completed');
                setLoading(false);
                updateMessage(streamingMessageIdRef.current, {
                  status: 'completed',
                  content: accumulatedContentRef.current,
                  codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                  files: filesRef.current.length > 0 ? filesRef.current : undefined,
                });
                // Stream will naturally end when Helium API closes the connection
                // stopStreaming() will be called in onComplete callback
                break;
            }
          },
          onError: (error: Error) => {
            if (streamingMessageIdRef.current) {
              handleError(error);
              updateMessage(streamingMessageIdRef.current, {
                status: 'error',
                error: error.message,
              });
            }
            setLoading(false);
            stopStreaming();
          },
          onComplete: async () => {
            console.log('Stream completed, fetching final response for files');
            // Stream has naturally ended - fetch final response to get files
            try {
              if (threadId && projectId && streamingMessageIdRef.current) {
                const finalResponse = await ChatService.getTaskResults(threadId, projectId, {
                  timeout: 30,
                  includeFileContent: false,
                });

                console.log('Final response files:', finalResponse.files);

                // Extract files from final response
                if (finalResponse.files && finalResponse.files.length > 0) {
                  const newFiles = finalResponse.files.map(f => ({
                    file_id: f.file_id,
                    file_name: f.file_name,
                    file_size: f.file_size || 0,
                  }));

                  console.log('Processing final response files:', newFiles);

                  // Merge with existing files (avoid duplicates)
                  newFiles.forEach(newFile => {
                    const exists = filesRef.current.some(f => f.file_id === newFile.file_id);
                    if (!exists) {
                      console.log('Adding final file:', newFile);
                      filesRef.current.push(newFile);
                    } else {
                      console.log('Final file already exists:', newFile.file_name);
                    }
                  });

                  // Update message with all files
                  console.log('Updating message with final files:', filesRef.current);
                  updateMessage(streamingMessageIdRef.current, {
                    content: accumulatedContentRef.current,
                    codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                    files: filesRef.current.length > 0 ? [...filesRef.current] : undefined,
                  });
                  console.log('Updated message with final files:', filesRef.current);
                } else {
                  console.log('No files in final response');
                }

                // Save assistant message to database
                if (currentUser && streamingMessageIdRef.current) {
                  try {
                    console.log('Saving assistant message to database:', {
                      messageId: streamingMessageIdRef.current,
                      contentLength: accumulatedContentRef.current.length,
                      filesCount: filesRef.current.length,
                      codeBlocksCount: codeBlocksRef.current.length,
                    });
                    
                    // Construct the message directly from refs instead of relying on state
                    const assistantMessage: ChatMessage = {
                      id: streamingMessageIdRef.current,
                      role: 'assistant',
                      content: accumulatedContentRef.current,
                      timestamp: new Date(),
                      status: 'completed',
                      files: filesRef.current.length > 0 ? filesRef.current : undefined,
                      codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                      toolExecutions: toolExecutionsRef.current.length > 0 ? toolExecutionsRef.current : undefined,
                    };
                    
                    await DBClient.saveMessage(threadId, assistantMessage);
                    console.log('✓ Assistant message saved to database successfully');
                    
                    // Reload threads to update the sidebar
                    await loadThreads(currentUser.id);
                  } catch (dbError) {
                    console.error('❌ Error saving assistant message to database:', dbError);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching final files:', error);
            }
            
            // Clean up
            updateStatus('completed');
            setLoading(false);
            stopStreaming();
          },
        }
      ).then((abortStream) => {
        streamAbortRef.current = abortStream;
      }).catch((error) => {
        handleError(error);
        setLoading(false);
        stopStreaming();
      });
    },
    [updateMessage, updateStatus, setLoading, handleError, stopStreaming, currentUser, loadThreads]
  );

  // Detect new thread and start streaming automatically
  useEffect(() => {
    // Only start streaming if:
    // 1. This is a new thread (has ?new=true parameter)
    // 2. Thread info is set
    // 3. We have exactly 1 message (the user message we just saved)
    if (isNewThread && state.threadId && state.projectId && state.messages.length === 1) {
      console.log('New thread detected, starting streaming automatically');
      
      // Add assistant message placeholder to show loading indicator
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
        status: 'running',
      });
      
      // Start streaming
      setLoading(true);
      updateStatus('waiting');
      startStreaming(state.threadId, state.projectId, assistantMessageId);
      
      // Remove the 'new' query parameter from URL
      router.replace(`/project/${projectId}/thread/${threadId}`, { scroll: false });
    }
  }, [isNewThread, state.threadId, state.projectId, state.messages.length, addMessage, setLoading, updateStatus, startStreaming, router, projectId, threadId]);

  const handleSend = useCallback(
    async (message: string, files?: File[]) => {
      if (!message.trim() && (!files || files.length === 0)) {
        return;
      }

      if (!state.threadId || !state.projectId) {
        console.error('No thread context available');
        return;
      }

      try {
        setLoading(true);
        updateStatus('sending');

        const uploadedFilesData = files && files.length > 0
          ? files.map(file => ({
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
            }))
          : undefined;

        const userMessageId = addMessage({
          role: 'user',
          content: message,
          status: 'sending',
          uploadedFiles: uploadedFilesData,
        });

        const assistantMessageId = addMessage({
          role: 'assistant',
          content: '',
          status: 'running',
        });

        // Continue conversation
        await ChatService.continueConversation(state.threadId, state.projectId, message, files);

        // Save user message to database
        if (currentUser) {
          await DBClient.saveMessage(state.threadId, {
            id: userMessageId,
            role: 'user',
            content: message,
            timestamp: new Date(),
            status: 'completed',
            uploadedFiles: uploadedFilesData,
          });
        }

        updateStatus('waiting');
        
        // Start streaming
        startStreaming(state.threadId, state.projectId, assistantMessageId);
      } catch (error) {
        handleError(error);
        stopStreaming();
      }
    },
    [state.threadId, state.projectId, addMessage, setLoading, updateStatus, handleError, stopStreaming, startStreaming, currentUser]
  );

  const handleStop = useCallback(() => {
    if (state.threadId && state.projectId) {
      ChatService.stopTask(state.threadId, state.projectId).catch(console.error);
    }
    
    // Update the message status to 'stopped' to hide the loading indicator
    if (streamingMessageIdRef.current) {
      const currentContent = accumulatedContentRef.current.trim();
      updateMessage(streamingMessageIdRef.current, {
        status: 'stopped',
        content: currentContent || 'Agent Stopped',
        codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
        files: filesRef.current.length > 0 ? filesRef.current : undefined,
      });
    }
    
    stop();
    stopStreaming();
  }, [state.threadId, state.projectId, stop, stopStreaming, updateMessage]);

  const handleUpdateUser = useCallback(async (userData: { email?: string; username?: string; full_name?: string }) => {
    if (!currentUser) return;
    const updatedUser = await DBClient.updateUser(currentUser.id, userData);
    setCurrentUser(updatedUser);
  }, [currentUser]);

  return (
    <main className="flex h-screen bg-white relative overflow-hidden w-full max-w-full">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        threads={threads}
        onThreadDeleted={() => currentUser && loadThreads(currentUser.id)}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative z-10 w-full">
        <nav className="navbar w-full bg-white border-b border-gray-200">
          <div className="flex items-center justify-between w-full px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-3">
              {state.threadId && state.projectId && (
                <button
                  onClick={() => setFileModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out"
                  aria-label="View thread files"
                  title="View all files in this thread"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-hidden">
          <ChatContainer
            messages={state.messages}
            onSend={handleSend}
            onStop={handleStop}
            disabled={state.isLoading}
            isLoading={state.isLoading}
            threadId={state.threadId}
            projectId={state.projectId}
            userName={currentUser?.full_name || currentUser?.username}
          />
        </div>

        {state.error && (
          <div className="bg-red-900/30 border-t border-red-800 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-red-300">{state.error}</p>
              </div>
              <button onClick={() => updateStatus('idle')} className="text-red-400 hover:text-red-300 transition-colors duration-150 ease-in-out">×</button>
            </div>
          </div>
        )}
      </div>

      <FileModal isOpen={fileModalOpen} onClose={() => setFileModalOpen(false)} threadId={state.threadId} projectId={state.projectId} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} currentUser={currentUser} onUpdateUser={handleUpdateUser} />
    </main>
  );
}
