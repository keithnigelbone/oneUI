/**
 * components/button/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy ButtonPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicButtonPage = dynamic(() => import('./ButtonPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ButtonComponentPage() {
  return <DynamicButtonPage />;
}
