import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';

export function useProjectList(
  brandId: Id<'brands'> | undefined,
  type?: 'single' | 'campaign'
) {
  const projects = useQuery(
    api.createProjects.list,
    brandId ? { brandId, type } : 'skip'
  );

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
  };
}
