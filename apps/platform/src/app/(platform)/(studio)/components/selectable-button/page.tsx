/**
 * components/selectable-button/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SelectableButtonPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicPage = dynamic(() => import('./SelectableButtonPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SelectableButtonComponentPage() {
  return <DynamicPage />;
}
