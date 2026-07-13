/**
 * components/icon-contained/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy IconContainedPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicIconContainedPage = dynamic(() => import('./IconContainedPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function IconContainedComponentPage() {
  return <DynamicIconContainedPage />;
}
