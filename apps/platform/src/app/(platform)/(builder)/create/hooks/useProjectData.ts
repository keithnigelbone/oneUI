import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';

export function useProjectData(projectId: Id<'createProjects'> | undefined) {
  const project = useQuery(api.createProjects.get, projectId ? { projectId } : 'skip');
  const assets = useQuery(api.createProjects.listAssets, projectId ? { projectId } : 'skip');

  const isLoading = project === undefined || assets === undefined;

  return {
    project: project ?? null,
    assets: assets ?? [],
    isLoading,
  };
}
