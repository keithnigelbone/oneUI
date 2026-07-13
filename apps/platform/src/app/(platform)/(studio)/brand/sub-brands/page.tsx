/**
 * brand/sub-brands/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SubBrandsContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const SubBrandsContent = dynamic(() => import('./SubBrandsContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SubBrandsPage() {
  return <SubBrandsContent />;
}
