/**
 * brand/members/page.tsx
 *
 * Members management for the current brand. Thin shell — compiles instantly
 * and shows a skeleton while the heavier BrandMembersPanel is compiled in the
 * background (matches the sub-brands page pattern).
 *
 * The panel itself guards on `useBrandRole(currentBrandId).canManageMembers`.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const BrandMembersPanel = dynamic(() => import('../_members/BrandMembersPanel'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function BrandMembersPage() {
  return <BrandMembersPanel />;
}
