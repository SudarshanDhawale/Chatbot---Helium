/**
 * Hook for managing Helium API key
 * Stores key in localStorage and provides validation
 */

'use client';

import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'helium_api_key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    setApiKey(storedKey);
    setIsLoading(false);
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
  };

  return {
    apiKey,
    isLoading,
    hasApiKey: !!apiKey,
    saveApiKey,
    clearApiKey,
  };
}
