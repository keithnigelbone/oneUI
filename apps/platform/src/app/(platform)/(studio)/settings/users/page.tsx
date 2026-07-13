/**
 * settings/users/page.tsx
 *
 * Owner-only platform-access admin, reached from Settings (gear → "Platform
 * access"), not from the Brand nav. Thin shell — compiles instantly and shows
 * a skeleton while the heavier PlatformUsersPanel is compiled in the
 * background. The panel re-checks ownership; `listAllUsers` returns [] for
 * non-owners.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const PlatformUsersPanel = dynamic(() => import('../_users/PlatformUsersPanel'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function PlatformUsersPage() {
  return <PlatformUsersPanel />;
}
