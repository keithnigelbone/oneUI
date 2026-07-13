/**
 * components/chip/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy ChipPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicChipPage = dynamic(() => import('./ChipPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ChipComponentPage() {
  return <DynamicChipPage />;
}
