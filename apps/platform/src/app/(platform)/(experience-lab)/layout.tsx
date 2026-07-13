'use client';

/**
 * (experience-lab)/layout.tsx
 *
 * ISOLATED layout for the Jio AI Experience Builder Lab route group (LAB-03 /
 * Pitfall 3). This layout deliberately:
 *
 *   - does NOT share the `(builder)` layout,
 *   - does NOT wrap, reorder, or re-mount `FoundationStyleProvider`,
 *   - does NOT import `ExperienceCanvas` or any `(builder)` internal.
 *
 * The Lab is one-way isolated from the existing Builder: it may never become a
 * dependency of the existing Builder, and it must never reach into the
 * Builder's providers or tldraw store. The platform shell (and its
 * FoundationStyleBridge) already wraps this group via the parent `(platform)`
 * layout.
 *
 * `<BrandEditGate>` is an app-level access component (not a Builder internal),
 * so wrapping here does not violate the Lab↔Builder isolation rule — it gives
 * viewers the read-only banner + inert controls instead of server errors.
 */

import { BrandEditGate } from '@/components/access/BrandEditGate';

export default function ExperienceLabLayout({ children }: { children: React.ReactNode }) {
  return <BrandEditGate>{children}</BrandEditGate>;
}
