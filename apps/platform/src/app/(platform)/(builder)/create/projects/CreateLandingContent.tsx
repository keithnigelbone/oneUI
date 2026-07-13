/**
 * CreateLandingContent — Grid of project cards with filtering and creation wizard
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { useProjectList } from '../hooks/useProjectList';
import { ProjectCard, NewProjectCard } from '../components/ProjectCard';
import { ProjectWizard } from '../components/ProjectWizard';
import type { ProjectWizardData } from '../components/ProjectWizard';
import styles from './CreateLandingContent.module.css';

type StatusFilter = 'all' | 'draft' | 'active' | 'completed' | 'archived';
type TypeFilter = 'all' | 'single' | 'campaign';

const STATUS_FILTERS: StatusFilter[] = ['all', 'draft', 'active', 'completed', 'archived'];
const TYPE_FILTERS: TypeFilter[] = ['all', 'single', 'campaign'];

export default function CreateLandingContent() {
  const { currentBrand } = usePlatformContext();
  const router = useRouter();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const { projects, isLoading } = useProjectList(brandId);
  const createProject = useMutation(api.createProjects.create);
  const removeProject = useMutation(api.createProjects.remove);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.type === typeFilter);
    }
    return result;
  }, [projects, statusFilter, typeFilter]);

  const handleProjectClick = useCallback(
    (id: string) => {
      router.push(`/create/projects/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this project? This cannot be undone.')) return;
      try {
        await removeProject({ projectId: id as Id<'createProjects'> });
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    },
    [removeProject]
  );

  const handleCreate = useCallback(
    async (data: ProjectWizardData) => {
      if (!brandId) return;
      setIsCreating(true);
      try {
        const projectId = await createProject({
          brandId,
          name: data.name,
          description: data.description,
          type: data.projectType,
          platforms: data.platforms,
          audience: data.audience,
          tone: data.tone,
          objectives: undefined,
          brief: data.brief,
          assetType: data.assetType,
        });
        if (data.referenceImages?.length) {
          try {
            sessionStorage.setItem(
              `create-ref-images:${projectId}`,
              JSON.stringify(data.referenceImages)
            );
          } catch { /* storage full */ }
        }
        setShowWizard(false);
        router.push(`/create/projects/${projectId}`);
      } catch (err) {
        console.error('Failed to create project:', err);
      } finally {
        setIsCreating(false);
      }
    },
    [brandId, createProject, router]
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Projects</h1>
          </div>
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div className={styles.emptyTitle}>Select a brand</div>
          <div className={styles.emptyDescription}>
            Choose a brand in the top bar to create design-system-compliant marketing assets.
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4V2" />
              <path d="M15 16v-2" />
              <path d="M8 9h2" />
              <path d="M20 9h2" />
              <path d="M17.8 11.8 19 13" />
              <path d="M15 9h.01" />
              <path d="M17.8 6.2 19 5" />
              <path d="m3 21 9-9" />
              <path d="M12.2 6.2 11 5" />
            </svg>
          </div>
          <div className={styles.emptyTitle}>No projects yet</div>
          <div className={styles.emptyDescription}>
            Create your first AI-powered marketing project. Describe what you need and
            we&apos;ll generate on-brand assets for your platforms.
          </div>
          <Button attention="high" onPress={() => setShowWizard(true)}>
            Create Project
          </Button>
        </div>

        <ProjectWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onCreate={handleCreate}
          isCreating={isCreating}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Projects</h1>
          <span className={styles.count}>{projects.length}</span>
        </div>
        <div className={styles.filterRow}>
          <ToggleGroup
            value={[typeFilter]}
            onValueChange={(values) => setTypeFilter((values[0] as TypeFilter) ?? 'all')}
            variant="subtool"
          >
            {TYPE_FILTERS.map((t) => (
              <ToggleGroup.Item key={t} value={t}>
                {t === 'all' ? 'All' : t === 'single' ? 'Single' : 'Campaign'}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
          <ToggleGroup
            value={[statusFilter]}
            onValueChange={(values) => setStatusFilter((values[0] as StatusFilter) ?? 'all')}
            variant="subtool"
          >
            {STATUS_FILTERS.map((status) => (
              <ToggleGroup.Item key={status} value={status}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className={styles.grid}>
        <NewProjectCard onClick={() => setShowWizard(true)} />
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onClick={handleProjectClick}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ProjectWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
}
