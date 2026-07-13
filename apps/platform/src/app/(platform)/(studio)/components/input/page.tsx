/**
 * components/input/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy InputPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicInputPage = dynamic(() => import('./InputPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function InputComponentPage() {
  return <DynamicInputPage />;
}
