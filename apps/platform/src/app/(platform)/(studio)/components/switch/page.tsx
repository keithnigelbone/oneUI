/**
 * components/switch/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SwitchPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicSwitchPage = dynamic(() => import('./SwitchPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SwitchComponentPage() {
  return <DynamicSwitchPage />;
}
