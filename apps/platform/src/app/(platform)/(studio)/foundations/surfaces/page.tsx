/**
 * foundations/surfaces/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SurfacesContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const SurfacesContent = dynamic(() => import('./SurfacesContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SurfacesFoundationPage() {
  return <SurfacesContent />;
}
