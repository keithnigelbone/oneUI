/**
 * components/stepper/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy StepperPageContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicStepperPage = dynamic(() => import('./StepperPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function StepperComponentPage() {
  return <DynamicStepperPage />;
}
