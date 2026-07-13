/**
 * components/icon/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy IconPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicIconPage = dynamic(() => import('./IconPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function IconComponentPage() {
  return <DynamicIconPage />;
}
