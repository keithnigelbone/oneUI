/**
 * components/logo/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy LogoPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicLogoPage = dynamic(() => import('./LogoPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function LogoComponentPage() {
  return <DynamicLogoPage />;
}
