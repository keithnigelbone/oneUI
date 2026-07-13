'use client';

/**
 * BrandLogoContext.tsx
 *
 * Provides the current brand's logoSvg string to descendant components.
 * Populated by BrandProvider (from branding.json) in apps, and by Storybook's
 * BrandStyleInjector in stories. Consumed by the `Logo` component, which falls
 * back to this brand logo when no explicit content is passed.
 *
 * No Convex dependency — just a React context holding a string.
 */

'use client';

import { createContext, useContext } from 'react';

export interface BrandLogoContextValue {
  /** Raw SVG markup from the brand's logoSvg field, or undefined if not loaded */
  logoSvg?: string;
  /** Brand name for accessibility alt text */
  brandName?: string;
}

export const BrandLogoContext = createContext<BrandLogoContextValue>({});

/** Read the current brand's logoSvg from context */
export function useBrandLogo(): BrandLogoContextValue {
  return useContext(BrandLogoContext);
}