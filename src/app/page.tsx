/**
 * Main chat page
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';
import { FileModal } from '@/components/files/FileModal';
import { ProfileModal } from '@/components/user/ProfileModal';
import { UserAvatar } from '@/components/user/UserAvatar';
import Aurora from '@/components/Aurora/Aurora';
import { useChat } from '@/hooks/use-chat';
import { ChatService } from '@/lib/chat-service';
import { StreamService } from '@/lib/stream-service';
import { DBClient } from '@/lib/db-client';
import type { ChatMessage } from '@/types/chat';
import type { ThreadSummary } from '@/types/thread';
import type { StreamEvent } from '@/types/stream';

export default function Home() {
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

  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username?: string; full_name?: string } | null>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize user and load threads from database on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Use the actual user email - in production, this would come from authentication
        const defaultEmail = 'smdhawale77@gmail.com';
        const user = await DBClient.getOrCreateUser(defaultEmail);
        setCurrentUser(user);

        // Load threads from database
        const dbThreads = await DBClient.getUserThreads(user.id);
        
        // Convert database threads to ThreadSummary format
        const threadSummaries: ThreadSummary[] = dbThreads.map(thread => ({
          threadId: thread.thread_id,
          projectId: thread.project_id,
          title: thread.title,
          lastMessage: '', // Will be populated from messages if needed
          lastUpdated: new Date(thread.last_message_at),
          messageCount: thread.message_count,
        }));
        
        setThreads(threadSummaries);
      } catch (error) {
        console.error('Error initializing user:', error);
        // Fallback to empty state if database fails
        setCurrentUser({ id: 'temp', email: 'user@example.com' });
      }
    };

    initializeUser();
  }, []);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(event.target as Node)
      ) {
        setAvatarDropdownOpen(false);
      }
    };

    if (avatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [avatarDropdownOpen]);

  /**
   * Stop streaming and clean up
   */
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
                  } catch {
                    textChunk = event.content;
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
                  updateStatus('completed');
                  setLoading(false);
                  updateMessage(streamingMessageIdRef.current, {
                    status: 'completed',
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
                    // Get the current message from state
                    const currentMessage = state.messages.find(m => m.id === streamingMessageIdRef.current);
                    if (currentMessage) {
                      await DBClient.saveMessage(threadId, {
                        ...currentMessage,
                        content: accumulatedContentRef.current,
                        status: 'completed',
                        files: filesRef.current.length > 0 ? filesRef.current : undefined,
                        codeBlocks: codeBlocksRef.current.length > 0 ? codeBlocksRef.current : undefined,
                        toolExecutions: toolExecutionsRef.current.length > 0 ? toolExecutionsRef.current : undefined,
                      });
                      console.log('Assistant message saved to database');
                    }
                  } catch (dbError) {
                    console.error('Error saving assistant message to database:', dbError);
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
    [updateMessage, updateStatus, setLoading, handleError, stopStreaming, state.threadId, state.projectId, currentUser, state.messages]
  );

  const handleSend = useCallback(
    async (message: string, files?: File[]) => {
      if (!message.trim() && (!files || files.length === 0)) {
        return;
      }

      try {
        setLoading(true);
        updateStatus('sending');

        // Convert files to serializable format with object URLs
        const uploadedFilesData = files && files.length > 0
          ? files.map(file => {
              console.log('Processing uploaded file:', file.name, file.type, file.size);
              const url = URL.createObjectURL(file);
              console.log('Created URL for file:', url);
              return {
                name: file.name,
                type: file.type,
                size: file.size,
                url: url, // Create object URL for display
              };
            })
          : undefined;

        // Add user message with uploaded files
        console.log('Adding user message with uploadedFiles:', uploadedFilesData);
        const userMessageId = addMessage({
          role: 'user',
          content: message,
          status: 'sending',
          uploadedFiles: uploadedFilesData,
        });

        // Create task or continue conversation
        let threadId = state.threadId;
        let projectId = state.projectId;

        if (!threadId || !projectId) {
          // New conversation
          const taskResponse = await ChatService.createTask(message, files);
          threadId = taskResponse.threadId;
          projectId = taskResponse.projectId;
          setThreadInfo(threadId, projectId);

          // Save thread to database
          if (currentUser) {
            try {
              const threadTitle = message.length > 50 ? message.substring(0, 50) + '...' : message;
              await DBClient.createThread(
                currentUser.id,
                threadId,
                projectId,
                threadTitle
              );

              // Reload threads from database
              const dbThreads = await DBClient.getUserThreads(currentUser.id);
              const threadSummaries: ThreadSummary[] = dbThreads.map(thread => ({
                threadId: thread.thread_id,
                projectId: thread.project_id,
                title: thread.title,
                lastMessage: message,
                lastUpdated: new Date(thread.last_message_at),
                messageCount: thread.message_count,
              }));
              setThreads(threadSummaries);

              // Save user message to database
              await DBClient.saveMessage(threadId, {
                id: userMessageId,
                role: 'user',
                content: message,
                timestamp: new Date(),
                status: 'completed',
                uploadedFiles: uploadedFilesData,
              });
            } catch (dbError) {
              console.error('Error saving to database:', dbError);
              // Continue even if database save fails
            }
          }
        } else {
          // Continue conversation and save message to database
          if (currentUser) {
            try {
              await DBClient.saveMessage(threadId, {
                id: userMessageId,
                role: 'user',
                content: message,
                timestamp: new Date(),
                status: 'completed',
                uploadedFiles: uploadedFilesData,
              });

              // Reload threads to update message count
              const dbThreads = await DBClient.getUserThreads(currentUser.id);
              const threadSummaries: ThreadSummary[] = dbThreads.map(thread => ({
                threadId: thread.thread_id,
                projectId: thread.project_id,
                title: thread.title,
                lastMessage: thread.thread_id === threadId ? message : '',
                lastUpdated: new Date(thread.last_message_at),
                messageCount: thread.message_count,
              }));
              setThreads(threadSummaries);
            } catch (dbError) {
              console.error('Error saving to database:', dbError);
            }
          }
          
          // Continue conversation
          await ChatService.continueConversation(threadId, projectId, message, files);
        }

        // Add assistant message placeholder
        const assistantMessageId = addMessage({
          role: 'assistant',
          content: '',
          status: 'running',
        });

        updateStatus('waiting');

        // Start streaming with validated IDs
        startStreaming(threadId, projectId, assistantMessageId);
      } catch (error) {
        handleError(error);
        stopStreaming();
      }
    },
    [
      state.threadId,
      state.projectId,
      addMessage,
      setLoading,
      updateStatus,
      setThreadInfo,
      handleError,
      startStreaming,
      stopStreaming,
      currentUser,
    ]
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

  const handleSelectThread = useCallback(
    async (threadId: string, projectId: string) => {
      try {
        stopStreaming(); // Stop any ongoing streaming
        setLoading(true);
        reset();
        setThreadInfo(threadId, projectId);
        setSidebarOpen(false);

        // Try to load from database first
        if (currentUser) {
          try {
            const dbMessages = await DBClient.getThreadMessages(threadId);
            if (dbMessages.length > 0) {
              setMessages(dbMessages);
              setLoading(false);
              return;
            }
          } catch (dbError) {
            console.error('Error loading from database, falling back to API:', dbError);
          }
        }

        // Fallback: Load conversation history from Helium API
        const history = await ChatService.getConversationHistory(threadId, projectId);
        
        // Convert history messages to chat messages
        const messages: ChatMessage[] = history.messages.map((msg) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          status: 'completed' as const,
        }));

        // Set messages directly
        setMessages(messages);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [reset, setThreadInfo, setLoading, setMessages, handleError, stopStreaming, currentUser]
  );

  const handleNewChat = useCallback(() => {
    stopStreaming();
    reset();
    setSidebarOpen(false);
  }, [reset, stopStreaming]);

  const handleUpdateUser = useCallback(async (userData: { email?: string; username?: string; full_name?: string }) => {
    if (!currentUser) return;
    
    const updatedUser = await DBClient.updateUser(currentUser.id, userData);
    setCurrentUser(updatedUser);
  }, [currentUser]);

  return (
    <main className="flex h-screen bg-navy-900 relative overflow-hidden w-full max-w-full">
      {/* Aurora Background - Disabled for ChatGPT-style theme */}
      {/* <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={['#7cff67', '#B19EEF', '#5227FF']}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div> */}

      {/* Sidebar */}
      {/* On mobile: overlay with z-50, On desktop: docked with relative positioning */}
      <ConversationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        threads={threads}
        currentThreadId={state.threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      {/* Main content */}
      {/* Flex-1 ensures it takes remaining space after sidebar on desktop */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10 w-full">
        {/* Header */}
        <header className="border-b border-navy-700 bg-black px-4 lg:px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out"
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
                aria-controls="conversation-sidebar"
                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div className="text-center">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-100">AI BRAIN</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Folder icon button - only show when thread is active, hidden on mobile */}
              {state.threadId && state.projectId && (
                <button
                  onClick={() => setFileModalOpen(true)}
                  className="hidden sm:block p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out"
                  aria-label="View thread files"
                  title="View all files in this thread"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </button>
              )}
              
              {/* User Profile Section */}
              <div className="relative flex items-center gap-2" ref={avatarDropdownRef}>
                {/* Score/Status Indicator - hidden on mobile */}
                <span className="hidden sm:block text-xs font-semibold text-gray-300">
                  6/75
                </span>
                
                {/* User Avatar */}
                <UserAvatar
                  userName={currentUser?.full_name || currentUser?.username || 'User'}
                  size={36}
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  aria-expanded={avatarDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                />

                {/* Dropdown Menu */}
                {avatarDropdownOpen && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-56 bg-navy-900 border border-navy-700 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-md"
                    role="menu"
                    aria-label="User account menu"
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-navy-700">
                      <p className="text-sm font-bold text-gray-100">{currentUser?.full_name || currentUser?.username || 'User'}</p>
                      <p className="text-xs font-normal text-gray-400 mt-1">{currentUser?.email || 'user@example.com'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileModalOpen(true);
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-gray-100 transition-all duration-150 ease-in-out flex items-center gap-3"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          console.log('Settings clicked');
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-gray-100 transition-all duration-150 ease-in-out flex items-center gap-3"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          console.log('Help clicked');
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-gray-100 transition-all duration-150 ease-in-out flex items-center gap-3"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Help & Support</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-navy-700"></div>

                    {/* Logout */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          console.log('Logout clicked');
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-navy-800 hover:text-red-300 transition-all duration-150 ease-in-out flex items-center gap-3"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat container */}
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

        {/* Error banner */}
        {state.error && (
          <div className="bg-red-900/30 border-t border-red-800 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Error"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-semibold text-red-300">{state.error}</p>
              </div>
              <button
                onClick={() => {
                  // Clear error
                  updateStatus('idle');
                }}
                className="text-red-400 hover:text-red-300 transition-colors duration-150 ease-in-out"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Modal */}
      <FileModal
        isOpen={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        threadId={state.threadId}
        projectId={state.projectId}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </main>
  );
}
