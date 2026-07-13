'use client';

/**
 * foundations/layout.tsx
 *
 * Foundations section layout
 * Handles routing between: color, typography, spacing, shapes, elevation, motion
 * Secondary navigation is handled by the main platform layout via Shell
 *
 * Wraps every foundation editor page in `<BrandEditGate>` — when the
 * signed-in user lacks edit access to the current brand (viewer role, or no
 * membership) the gate shows the ReadOnlyBanner and makes the editors
 * genuinely non-interactive (inert). One insertion point covers all 14 pages.
 */

import React from 'react';
import { BrandEditGate } from '@/components/access/BrandEditGate';

export default function FoundationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrandEditGate>{children}</BrandEditGate>;
}
