/**
 * useAutoSave.ts
 *
 * Hook for automatic real-time sync to Convex with debouncing.
 *
 * Uses a timer-based debounce (not a debounced state value) to avoid the
 * stale-initial-state problem: useDebounce(config) initialises with the
 * empty-state config and takes 800ms to catch up, causing spurious saves
 * of empty data during initialisation. By debouncing the SAVE ACTION
 * instead of the VALUE, we always compare and save the latest config.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';

type FoundationType =
  | 'color'
  | 'surfaces'
  | 'materials'
  | 'typography'
  | 'spacing'
  | 'dimension'
  | 'shape'
  | 'elevation'
  | 'motion'
  | 'icons'
  | 'platforms'
  | 'grid'
  | 'gradients';

export interface UseAutoSaveOptions<T> {
  /** The config object to auto-save */
  config: T;
  /** The brand ID (Convex ID) */
  brandId: string | undefined;
  /** The foundation type */
  type: FoundationType;
  /** Debounce delay in milliseconds (default: 800ms) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save succeeds */
  onSave?: () => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn {
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Timestamp of the last successful save */
  lastSaved: Date | null;
  /** Force a save immediately (bypasses debounce) */
  saveNow: () => Promise<void>;
}

/**
 * Auto-save config to Convex with debouncing.
 *
 * @example
 * ```tsx
 * const [config, setConfig] = useState(DEFAULT_CONFIG);
 *
 * const { isSaving, lastSaved } = useAutoSave({
 *   config,
 *   brandId,
 *   type: 'spacing',
 * });
 *
 * // Optional: Show save indicator
 * {isSaving && <span>Saving...</span>}
 * ```
 */
export function useAutoSave<T>({
  config,
  brandId,
  type,
  debounceMs = 800,
  enabled = true,
  onSave,
  onError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const upsert = useMutation(api.foundations.upsertByType);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track what was last saved to detect actual changes
  const previousConfigRef = useRef<string>('');
  const wasEnabledRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref to the latest config so the timeout callback always reads
  // the most recent value, not a stale closure capture.
  const configRef = useRef(config);
  configRef.current = config;

  const currentConfigString = JSON.stringify(config);

  // Force save function (bypasses debounce)
  const saveNow = useCallback(async () => {
    if (!brandId) return;

    // Cancel any pending debounced save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setIsSaving(true);
    try {
      await upsert({
        brandId: brandId as Id<'brands'>,
        type,
        config,
      });
      previousConfigRef.current = JSON.stringify(config);
      setLastSaved(new Date());
      onSave?.();
    } catch (error) {
      console.error(`Auto-save failed for ${type}:`, error);
      onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [brandId, type, config, upsert, onSave, onError]);

  // Auto-save effect with built-in debounce timer
  useEffect(() => {
    // When enabled transitions from false to true, capture baseline (skip saving).
    // Uses currentConfigString (the live config) so the baseline reflects
    // the actual loaded data, not a stale debounced value.
    if (enabled && !wasEnabledRef.current) {
      wasEnabledRef.current = true;
      previousConfigRef.current = currentConfigString;
      return;
    }

    // When disabled, reset tracking and cancel pending saves
    if (!enabled) {
      wasEnabledRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      return;
    }

    // Skip if no brand or no actual change from what was last saved
    if (!brandId || currentConfigString === previousConfigRef.current) {
      return;
    }

    // Cancel any pending save (restarts the debounce timer)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Schedule a debounced save. The callback reads from configRef to get
    // the latest config at fire time (not the stale closure value).
    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null;

      const latestConfig = configRef.current;
      const latestConfigString = JSON.stringify(latestConfig);

      // Re-check in case config reverted back while the timer was pending
      if (latestConfigString === previousConfigRef.current) return;

      setIsSaving(true);
      try {
        await upsert({
          brandId: brandId as Id<'brands'>,
          type,
          config: latestConfig,
        });
        previousConfigRef.current = latestConfigString;
        setLastSaved(new Date());
        onSave?.();
      } catch (error) {
        console.error(`Auto-save failed for ${type}:`, error);
        onError?.(error as Error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // Cleanup: cancel the timer if the effect re-runs or unmounts
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [currentConfigString, brandId, type, enabled, upsert, debounceMs, onSave, onError]);

  return { isSaving, lastSaved, saveNow };
}
