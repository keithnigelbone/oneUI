/**
 * debounce.ts
 *
 * Debounced save hook for optimizing Convex mutations
 */

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Hook for debounced save operations
 *
 * @param saveFn - Async function to call for saving
 * @param delay - Debounce delay in milliseconds (default: 1000ms)
 * @returns Object with debouncedSave function and pending state
 */
export function useDebouncedSave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 1000
): {
  debouncedSave: (data: T) => void;
  isPending: boolean;
  cancel: () => void;
  flush: () => Promise<void>;
} {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingDataRef.current = null;
    setIsPending(false);
  }, []);

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const data = pendingDataRef.current;
    if (data !== null) {
      pendingDataRef.current = null;
      await saveFn(data);
      setIsPending(false);
    }
  }, [saveFn]);

  const debouncedSave = useCallback(
    (data: T) => {
      // Store pending data
      pendingDataRef.current = data;
      setIsPending(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        const pendingData = pendingDataRef.current;
        if (pendingData !== null) {
          pendingDataRef.current = null;
          try {
            await saveFn(pendingData);
          } finally {
            setIsPending(false);
          }
        }
      }, delay);
    },
    [saveFn, delay]
  );

  return { debouncedSave, isPending, cancel, flush };
}

/**
 * Simple debounce function for non-hook usage
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
