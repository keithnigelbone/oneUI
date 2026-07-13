'use client';

/**
 * create/layout.tsx — Secondary nav comes from the platform layout.
 *
 * Wraps the builder in `<BrandEditGate>` so viewers get the read-only
 * banner + inert controls instead of server-side mutation errors.
 */

import { BrandEditGate } from '@/components/access/BrandEditGate';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <BrandEditGate>{children}</BrandEditGate>;
}
