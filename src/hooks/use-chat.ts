/**
 * Custom hook for managing chat state and interactions
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatState } from '@/types/chat';
import type { TaskStatus } from '@/types/helium';
import { getErrorMessage } from '@/utils/errors';

interface UseChatOptions {
  onError?: (error: string) => void;
  onStatusChange?: (status: ChatState['currentStatus']) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    threadId: null,
    projectId: null,
    currentStatus: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const updateStatus = useCallback(
    (status: ChatState['currentStatus']) => {
      setState((prev) => ({ ...prev, currentStatus: status }));
      options.onStatusChange?.(status);
    },
    [options]
  );

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage.id;
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      }));
    },
    []
  );

  const setError = useCallback(
    (error: string | null) => {
      setState((prev) => ({ ...prev, error }));
      if (error) {
        options.onError?.(error);
      }
    },
    [options]
  );

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setThreadInfo = useCallback(
    (threadId: string | null, projectId: string | null) => {
      setState((prev) => ({ ...prev, threadId, projectId }));
    },
    []
  );

  const handleError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      updateStatus('error');
      setLoading(false);
    },
    [setError, updateStatus, setLoading]
  );

  const setMessages = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, messages }));
  }, []);

  const reset = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      threadId: null,
      projectId: null,
      currentStatus: 'idle',
    });
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    updateStatus('idle');
  }, [setLoading, updateStatus]);

  return {
    state,
    addMessage,
    updateMessage,
    setMessages,
    setError,
    setLoading,
    setThreadInfo,
    handleError,
    updateStatus,
    reset,
    stop,
  };
}
