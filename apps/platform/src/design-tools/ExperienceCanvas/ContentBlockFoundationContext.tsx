'use client';

import { createContext, useContext } from 'react';
import type { PlatformEntry } from '@oneui/shared';

/**
 * Enabled Density & Platforms foundation entries for the current canvas (usually platform brand).
 * Lets ContentBlock resolve `foundationPlatformId` → dimension overrides when snapshots omit inline overrides.
 */
export const ContentBlockFoundationPlatformsContext = createContext<readonly PlatformEntry[] | null>(
  null,
);

export function useContentBlockFoundationPlatforms(): readonly PlatformEntry[] | null {
  return useContext(ContentBlockFoundationPlatformsContext);
}
