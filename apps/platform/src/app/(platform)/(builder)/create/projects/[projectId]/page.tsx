'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';
import { useParams } from 'next/navigation';

const ProjectWorkspace = dynamic(() => import('./ProjectWorkspace'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CreateProjectPage() {
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : '';

  if (!projectId) {
    return <PageLoader />;
  }

  return <ProjectWorkspace projectId={projectId} />;
}
