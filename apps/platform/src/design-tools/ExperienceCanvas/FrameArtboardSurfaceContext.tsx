'use client';

import { createContext, useContext } from 'react';
import type { FrameArtboardSurface } from './artboardFrameSurfaceStore';

export type FrameArtboardSurfaceContextValue = {
  surfaces: Record<string, FrameArtboardSurface>;
  setFrameArtboardSurface: (frameId: string, surface: FrameArtboardSurface | null) => void;
};

export const FrameArtboardSurfaceContext = createContext<FrameArtboardSurfaceContextValue | null>(null);

export function useFrameArtboardSurfaceContext(): FrameArtboardSurfaceContextValue | null {
  return useContext(FrameArtboardSurfaceContext);
}
