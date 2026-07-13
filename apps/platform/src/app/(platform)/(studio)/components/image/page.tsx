/**
 * components/image/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy ImagePageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicImagePage = dynamic(() => import('./ImagePageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ImageComponentPage() {
  return <DynamicImagePage />;
}
