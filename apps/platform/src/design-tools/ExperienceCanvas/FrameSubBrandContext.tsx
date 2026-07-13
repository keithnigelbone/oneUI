'use client';

import { createContext, useContext } from 'react';
import type { SubBrandAccentFields } from '@oneui/shared';

/** Full sub-brand row (for accent merge + CSS generation), aligned with Convex / PlatformContext */
export type ArtboardSubBrandOption = SubBrandAccentFields & {
  id: string;
  name: string;
  slug: string;
  parentBrandId?: string;
};

export type FrameSubBrandContextValue = {
  /** Selected sub-brand Convex id per frame id, or null/empty for base brand */
  frameSubBrandByFrameId: Record<string, string | null>;
  setFrameSubBrand: (frameId: string, subBrandId: string | null) => void;
  availableSubBrands: readonly ArtboardSubBrandOption[];
  /**
   * Parent brand `getBrandOverviewData` (same source as `ArtboardSubBrandStyleTags`).
   * Used on-canvas to resolve sub-brand surface fills without relying on CSS var cascade
   * inside tldraw’s HTML layer (sidebar swatches still use tokens + data-oneui-subbrand).
   */
  baseFoundationData: Record<string, unknown> | null;
  /** Must match `data-theme` so resolved steps match injected scoped brand CSS */
  theme: 'light' | 'dark';
};

export const FrameSubBrandContext = createContext<FrameSubBrandContextValue | null>(null);

export function useFrameSubBrandContext(): FrameSubBrandContextValue | null {
  return useContext(FrameSubBrandContext);
}
