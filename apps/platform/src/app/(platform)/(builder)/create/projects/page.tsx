'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const CreateLandingContent = dynamic(() => import('./CreateLandingContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CreateProjectsPage() {
  return <CreateLandingContent />;
}
