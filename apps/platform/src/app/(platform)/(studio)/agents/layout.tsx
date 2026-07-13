'use client';

/**
 * agents/layout.tsx
 *
 * Wraps every agents editing surface (tone-of-voice, design-composition
 * rules/skills/evaluation/playground) in `<BrandEditGate>` so viewers get
 * the read-only banner + genuinely inert controls instead of server errors.
 */

import { BrandEditGate } from '@/components/access/BrandEditGate';

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrandEditGate>{children}</BrandEditGate>;
}
