'use client';

/**
 * BrandFoundationContext.tsx
 *
 * Surfaces the active brand's `ThemeConfig` to the React tree so primitives
 * that need brand-accurate scale data (Surface, custom layout components)
 * can call `@oneui/shared/engine` resolvers directly instead of using
 * scale-free approximations.
 *
 * Provider lives at the same boundary that calls `useBrandCSS`:
 *   - Storybook: `apps/storybook/.storybook/BrandStyleDecorator.tsx`
 *   - Platform:  `apps/platform/src/components/FoundationStyleProvider.tsx`
 *
 * The CSS-injection pipeline is unchanged. This context is purely a
 * read-side conduit for the JSX bridge described in
 * `docs/rfcs/0003-surface-step-cascade/02-completion-plan.md` Phase 1.
 *
 * Default value is `null` — components must handle the absent-brand case
 * (Storybook with no brand selected, SSR pre-hydration). Surface falls
 * back to its scale-free `approxResolveStep` when this returns null.
 */

'use client';

import { createContext, useContext } from 'react';
import type { ThemeConfig } from '@oneui/shared/engine';

const BrandFoundationContext = createContext<ThemeConfig | null>(null);

export const BrandFoundationProvider = BrandFoundationContext.Provider;

/**
 * Reads the active brand's `ThemeConfig`. Returns `null` when no brand
 * is selected — callers must handle that case.
 */
export function useBrandFoundation(): ThemeConfig | null {
  return useContext(BrandFoundationContext);
}

// Re-export the raw context for advanced cases (testing, custom providers).
export { BrandFoundationContext };