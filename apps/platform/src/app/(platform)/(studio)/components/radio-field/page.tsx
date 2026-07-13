/**
 * components/radio-field/page.tsx
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicPage = dynamic(() => import('./RadioFieldPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RadioFieldComponentPage() {
  return <DynamicPage />;
}
