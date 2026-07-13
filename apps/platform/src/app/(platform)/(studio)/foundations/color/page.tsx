/**
 * foundations/color/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy ColorContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const ColorContent = dynamic(() => import('./ColorContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ColorFoundationPage() {
  return <ColorContent />;
}
