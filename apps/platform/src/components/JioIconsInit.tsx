'use client';

/**
 * JioIconsInit Component
 *
 * Client component that initializes Jio icons synchronously.
 * Uses module-level initialization to ensure icons are available
 * before the first render of any Icon component.
 *
 * Should be placed high in the component tree (e.g., in layout).
 */

import { initJioIcons, isJioIconsInitialized } from '@/lib/initJioIcons';

// Module-level initialization flag
let moduleInitialized = false;

// Initialize Jio icons synchronously when this module is first imported
// This ensures the loader is registered before any Icon components render
if (typeof window !== 'undefined' && !moduleInitialized) {
  moduleInitialized = true;
  initJioIcons();
}

export function JioIconsInit(): null {
  // Also check and initialize on first render in case module init didn't run
  // (e.g., due to code splitting or dynamic imports)
  if (typeof window !== 'undefined' && !isJioIconsInitialized()) {
    initJioIcons();
  }

  return null;
}

export default JioIconsInit;
