/**
 * components/divider/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy DividerPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicDividerPage = dynamic(() => import('./DividerPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function DividerComponentPage() {
  return <DynamicDividerPage />;
}
