/**
 * components/avatar/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy AvatarPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicAvatarPage = dynamic(() => import('./AvatarPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function AvatarComponentPage() {
  return <DynamicAvatarPage />;
}
