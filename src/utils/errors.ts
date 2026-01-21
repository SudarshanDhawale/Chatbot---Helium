/**
 * Error handling utilities
 */

import { HeliumApiError } from '@/lib/helium-client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HeliumApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof HeliumApiError) {
    return error.status;
  }
  return undefined;
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof HeliumApiError) {
    return error.status === 429;
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof HeliumApiError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}
