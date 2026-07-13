/**
 * components/radio/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy RadioPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicRadioPage = dynamic(() => import('./RadioPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RadioComponentPage() {
  return <DynamicRadioPage />;
}
