/**
 * brand/overview/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy OverviewContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const OverviewContent = dynamic(() => import('./OverviewContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function BrandOverviewPage() {
  return <OverviewContent />;
}
