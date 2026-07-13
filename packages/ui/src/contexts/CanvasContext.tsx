'use client';

/**
 * CanvasContext.tsx
 *
 * Lightweight context that signals components they are rendering inside
 * an editor canvas or preview harness. Components can opt-in to check
 * these flags for conditional behavior (e.g., suppress navigation,
 * disable animations, prevent side effects).
 */

'use client';

import { createContext, useContext } from 'react';

export interface CanvasContextValue {
  /** Whether the component is rendering inside an editor canvas */
  isCanvas: boolean;
  /** Suppress interactive behaviors (click handlers, navigation, etc.) */
  suppressInteractions: boolean;
  /** Suppress side effects (analytics, API calls, etc.) */
  suppressSideEffects: boolean;
}

const defaultValue: CanvasContextValue = {
  isCanvas: false,
  suppressInteractions: false,
  suppressSideEffects: false,
};

export const CanvasContext = createContext<CanvasContextValue>(defaultValue);

export function useCanvasContext(): CanvasContextValue {
  return useContext(CanvasContext);
}