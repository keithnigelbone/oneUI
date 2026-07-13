/**
 * ReduceMotionContext.tsx
 *
 * App-level provider that fires `AccessibilityInfo.isReduceMotionEnabled()`
 * exactly once at mount and subscribes to `reduceMotionChanged` for live
 * updates. Components consume the context via `useReduceMotion()` instead
 * of each scheduling its own bridge call.
 *
 * Why this exists: at scale (e.g. a screen mounting 240 Buttons), the
 * old per-instance pattern fires 240 redundant `AccessibilityInfo`
 * bridge calls in parallel — each one a measurable hit on first mount.
 * Hoisting to a single subscription closes that gap.
 *
 * The provider is mounted automatically by `OneUINativeThemeProvider` so
 * any app already using OneUI's theme runtime gets the perf win
 * transparently — no consumer-side migration required.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

const ReduceMotionContext = createContext<boolean>(false);

export interface ReduceMotionProviderProps {
  children: ReactNode;
}

export function ReduceMotionProvider({ children }: ReduceMotionProviderProps): React.ReactElement {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value: boolean) => setReduceMotion(value),
    );
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);

  return (
    <ReduceMotionContext.Provider value={reduceMotion}>
      {children}
    </ReduceMotionContext.Provider>
  );
}

/**
 * Read the platform's reduce-motion preference. Returns `false` when no
 * `<ReduceMotionProvider>` is mounted (graceful fallback — animations
 * play but consumers can opt into the perf-optimised provider).
 */
export function useReduceMotion(): boolean {
  return useContext(ReduceMotionContext);
}
