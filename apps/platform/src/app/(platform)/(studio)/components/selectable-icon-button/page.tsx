/**
 * components/selectable-icon-button/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SelectableIconButtonPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicPage = dynamic(() => import('./SelectableIconButtonPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SelectableIconButtonComponentPage() {
  return <DynamicPage />;
}
