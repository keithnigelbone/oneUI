/**
 * components/selectable-single-text-button/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy SelectableSingleTextButtonPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicPage = dynamic(() => import('./SelectableSingleTextButtonPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function SelectableSingleTextButtonComponentPage() {
  return <DynamicPage />;
}
