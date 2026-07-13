/**
 * components/link-button/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy LinkButtonPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicLinkButtonPage = dynamic(() => import('./LinkButtonPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function LinkButtonComponentPage() {
  return <DynamicLinkButtonPage />;
}
