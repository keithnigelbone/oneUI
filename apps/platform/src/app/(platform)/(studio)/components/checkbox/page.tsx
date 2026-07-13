/**
 * components/checkbox/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy CheckboxPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicCheckboxPage = dynamic(() => import('./CheckboxPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CheckboxComponentPage() {
  return <DynamicCheckboxPage />;
}
