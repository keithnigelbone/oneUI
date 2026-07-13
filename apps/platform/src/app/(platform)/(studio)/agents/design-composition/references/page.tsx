/**
 * agents/design-composition/references/page.tsx
 *
 * Reference UI Library — designers catalog Jio ecosystem screens by
 * collection (JioMart, JioCinema, MyJio…) and tag each screen with an
 * archetype + context. The Design Composition Agent resolves top-k
 * references at generation time and sends them as vision content blocks
 * so the LLM has real visual precedent, not just text rules.
 *
 * This page mirrors the depth of the tone-of-voice UI:
 *   - Collections grid (create, rename, archive)
 *   - Per-collection screen list with inline upload
 *   - Screen detail drawer: image, metadata edit, LLM analysis panel
 *   - Bulk upload with filename heuristics (archetype inferred from
 *     "hero-*", "product-grid-*" patterns)
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Input } from '@oneui/ui/components/Input';
import { Select } from '@oneui/ui/components/Select';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../composition.module.css';
import refStyles from './references.module.css';

const VERTICALS = [
  'entertainment',
  'e-commerce',
  'finance',
  'governance',
  'farm',
  'iot',
  'telecom',
  'mobility',
  'health',
  'general',
] as const;

const PLATFORMS = ['mobile', 'web', 'tablet', 'tv', 'print', 'outdoor'] as const;

const CONTEXTS = [
  'mobile-app',
  'web-app',
  'marketing-page',
  'social-post',
  'print',
  'outdoor',
] as const;

const COMMON_ARCHETYPES = [
  'hero',
  'product-grid',
  'product-detail',
  'player',
  'player-controls',
  'media-card',
  'settings',
  'login',
  'onboarding',
  'bottom-nav',
  'tab-bar',
  'list',
  'detail',
  'dashboard',
  'billboard',
  'brochure',
];

type ReferenceCollection = {
  _id: Id<'referenceCollections'>;
  name: string;
  description?: string;
  vertical: (typeof VERTICALS)[number];
  platform: (typeof PLATFORMS)[number];
  isBuiltIn: boolean;
  isArchived: boolean;
};

type ReferenceScreenRow = {
  _id: Id<'referenceScreens'>;
  collectionId: Id<'referenceCollections'>;
  storageId: Id<'_storage'>;
  name: string;
  archetype: string;
  context: (typeof CONTEXTS)[number];
  description?: string;
  mimeType: string;
  status: 'draft' | 'approved' | 'archived';
  version: number;
};

/** Derive an archetype guess from a filename: strips extension, picks prefix. */
function inferArchetype(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '').toLowerCase();
  for (const a of COMMON_ARCHETYPES) {
    if (base.startsWith(a) || base.includes(`-${a}-`) || base.endsWith(`-${a}`)) return a;
  }
  return base.split(/[-_]/)[0] || 'hero';
}

/** Fire-and-forget analysis kick-off. Auto-approves on success. */
async function requestAnalysis(screenId: string, force = false): Promise<void> {
  try {
    await fetch('/api/reference/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenId, force }),
    });
  } catch (err) {
    console.warn('[references] analysis request failed:', err);
  }
}

export default function ReferenceLibraryPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const collections = useQuery(api.references.listCollections, {}) as
    | ReferenceCollection[]
    | undefined;

  const createCollection = useMutation(api.references.createCollection);
  const updateCollection = useMutation(api.references.updateCollection);
  const deleteCollection = useMutation(api.references.deleteCollection);
  const generateUploadUrl = useMutation(api.references.generateUploadUrl);
  const createScreen = useMutation(api.references.createScreen);
  const updateScreen = useMutation(api.references.updateScreen);
  const deleteScreen = useMutation(api.references.deleteScreen);

  const [selectedCollectionId, setSelectedCollectionId] = useState<Id<'referenceCollections'> | null>(
    null,
  );
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [selectedScreenId, setSelectedScreenId] = useState<Id<'referenceScreens'> | null>(null);

  const selectedCollection = useMemo(
    () => collections?.find((c) => c._id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId],
  );

  const screens = useQuery(
    api.references.listScreens,
    selectedCollectionId ? { collectionId: selectedCollectionId } : 'skip',
  ) as ReferenceScreenRow[] | undefined;

  const selectedScreen = useMemo(
    () => screens?.find((s) => s._id === selectedScreenId) ?? null,
    [screens, selectedScreenId],
  );

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage the reference library.</p>
      </div>
    );
  }

  const activeCollections = collections?.filter((c) => !c.isArchived) ?? [];

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>References</h1>
        <p className={foundationStyles.description}>
          Catalog Jio ecosystem screens by collection and archetype. The Design
          Composition Agent sends top-matching screens as vision context alongside
          rules so generations are grounded in real visual precedent.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
        <Badge attention="medium" appearance="neutral" size="m">
          {activeCollections.length} collections
        </Badge>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            attention="medium"
            appearance="primary"
            size="xs"
            onPress={() => setShowAddCollection(true)}
          >
            New Collection
          </Button>
        </div>
      </div>

      <div className={foundationStyles.content}>
        {showAddCollection && (
          <NewCollectionForm
            onCancel={() => setShowAddCollection(false)}
            onCreate={async ({ name, vertical, platform, description }) => {
              const id = await createCollection({ name, vertical, platform, description });
              setShowAddCollection(false);
              setSelectedCollectionId(id as Id<'referenceCollections'>);
            }}
          />
        )}

        {activeCollections.length === 0 && !showAddCollection && (
          <FoundationCard
            title="No collections yet"
            description="Create a collection (e.g. JioCinema — Mobile) and upload reference screens so the composition agent can ground generations in real visual precedent."
          >
            <Button attention="high" onPress={() => setShowAddCollection(true)}>
              Create first collection
            </Button>
          </FoundationCard>
        )}

        <div className={refStyles.collectionGrid}>
          {activeCollections.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setSelectedCollectionId(c._id)}
              className={refStyles.collectionCard}
              data-selected={c._id === selectedCollectionId || undefined}
            >
              <div className={refStyles.collectionCardTitle}>{c.name}</div>
              <div className={refStyles.collectionCardMeta}>
                {c.vertical} · {c.platform}
                {c.isBuiltIn ? ' · built-in' : ''}
              </div>
              {c.description && (
                <div className={refStyles.collectionCardDescription}>{c.description}</div>
              )}
            </button>
          ))}
        </div>

        {selectedCollection && (
          <CollectionDetail
            collection={selectedCollection}
            screens={screens ?? []}
            onRename={async (name) =>
              updateCollection({ id: selectedCollection._id, name })
            }
            onArchive={async () =>
              updateCollection({ id: selectedCollection._id, isArchived: true }).then(() =>
                setSelectedCollectionId(null),
              )
            }
            onDelete={async () =>
              deleteCollection({ id: selectedCollection._id }).then(() =>
                setSelectedCollectionId(null),
              )
            }
            onUploadFiles={async (files) => {
              for (const file of files) {
                const uploadUrl = (await generateUploadUrl({})) as string;
                const res = await fetch(uploadUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': file.type || 'image/png' },
                  body: file,
                });
                const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
                const screenId = (await createScreen({
                  collectionId: selectedCollection._id,
                  storageId,
                  mimeType: file.type || 'image/png',
                  fileSize: file.size,
                  name: file.name.replace(/\.[^.]+$/, ''),
                  archetype: inferArchetype(file.name),
                  context:
                    selectedCollection.platform === 'mobile' ? 'mobile-app' : 'web-app',
                })) as Id<'referenceScreens'>;
                // Kick off Claude vision analysis in the background. On success
                // the route auto-promotes the screen from draft → approved.
                void requestAnalysis(screenId);
              }
            }}
            onSelectScreen={(id) => setSelectedScreenId(id)}
            onDeleteScreen={async (id) => {
              if (selectedScreenId === id) setSelectedScreenId(null);
              await deleteScreen({ id });
            }}
          />
        )}

        {selectedScreen && (
          <ScreenDetail
            screen={selectedScreen}
            onClose={() => setSelectedScreenId(null)}
            onSave={async (patch) => updateScreen({ id: selectedScreen._id, ...patch })}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function NewCollectionForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (args: {
    name: string;
    vertical: (typeof VERTICALS)[number];
    platform: (typeof PLATFORMS)[number];
    description?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vertical, setVertical] = useState<(typeof VERTICALS)[number]>('entertainment');
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>('mobile');
  const [submitting, setSubmitting] = useState(false);

  return (
    <FoundationCard title="New collection">
      <div className={styles.propertyList}>
        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Name</span>
          <Input value={name} onChange={setName} placeholder="JioCinema — Mobile" />
        </div>
        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Vertical</span>
          <Select
            value={vertical}
            onChange={(v) => setVertical(v as typeof vertical)}
            options={VERTICALS.map((v) => ({ value: v, label: v }))}
          />
        </div>
        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Platform</span>
          <Select
            value={platform}
            onChange={(v) => setPlatform(v as typeof platform)}
            options={PLATFORMS.map((p) => ({ value: p, label: p }))}
          />
        </div>
        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Description</span>
          <Input value={description} onChange={setDescription} placeholder="What this collection catalogs" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)' }}>
        <Button
          attention="high"
          size="s"
          onPress={async () => {
            if (!name.trim()) return;
            setSubmitting(true);
            try {
              await onCreate({ name: name.trim(), vertical, platform, description: description.trim() || undefined });
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting || !name.trim()}
        >
          Create
        </Button>
        <Button attention="low" appearance="neutral" size="s" onPress={onCancel}>
          Cancel
        </Button>
      </div>
    </FoundationCard>
  );
}

function CollectionDetail({
  collection,
  screens,
  onRename,
  onArchive,
  onDelete,
  onUploadFiles,
  onSelectScreen,
  onDeleteScreen,
}: {
  collection: ReferenceCollection;
  screens: ReferenceScreenRow[];
  onRename: (name: string) => Promise<unknown>;
  onArchive: () => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onUploadFiles: (files: File[]) => Promise<void>;
  onSelectScreen: (id: Id<'referenceScreens'>) => void;
  onDeleteScreen: (id: Id<'referenceScreens'>) => Promise<unknown>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(collection.name);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        await onUploadFiles(Array.from(files));
      } finally {
        setUploading(false);
      }
    },
    [onUploadFiles],
  );

  return (
    <FoundationCard
      title={collection.name}
      description={`${collection.vertical} · ${collection.platform} · ${screens.length} screens`}
      actions={
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
          <Button
            attention="low"
            appearance="neutral"
            size="xs"
            onPress={() => {
              setDraftName(collection.name);
              setRenaming(true);
            }}
          >
            Rename
          </Button>
          {!collection.isBuiltIn && (
            <>
              <Button attention="low" appearance="neutral" size="xs" onPress={onArchive}>
                Archive
              </Button>
              <Button
                attention="low"
                appearance="negative"
                size="xs"
                onPress={() => {
                  if (confirm(`Delete collection "${collection.name}"?`)) onDelete();
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      }
    >
      {renaming && (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginBottom: 'var(--Spacing-4)' }}>
          <Input value={draftName} onChange={setDraftName} />
          <Button
            attention="high"
            size="xs"
            onPress={async () => {
              await onRename(draftName.trim());
              setRenaming(false);
            }}
          >
            Save
          </Button>
          <Button attention="low" appearance="neutral" size="xs" onPress={() => setRenaming(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div
        className={refStyles.uploadZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFilesSelected(e.dataTransfer.files);
        }}
      >
        <span>
          Drag screens here or
          <button
            type="button"
            className={refStyles.uploadZoneTrigger}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'uploading…' : 'browse files'}
          </button>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      <div className={refStyles.screenGrid}>
        {screens.map((s) => (
          <ScreenThumb key={s._id} screen={s} onOpen={() => onSelectScreen(s._id)} onDelete={() => onDeleteScreen(s._id)} />
        ))}
        {screens.length === 0 && (
          <div style={{ color: 'var(--Text-Low)' }}>
            No screens yet — upload images via the drop zone above.
          </div>
        )}
      </div>
    </FoundationCard>
  );
}

function ScreenThumb({
  screen,
  onOpen,
  onDelete,
}: {
  screen: ReferenceScreenRow;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const url = useQuery(api.references.getStorageUrl, {
    storageId: screen.storageId,
  }) as string | null | undefined;

  return (
    <div className={refStyles.screenCard}>
      <button type="button" className={refStyles.screenThumb} onClick={onOpen}>
        {url ? (
          <img src={url} alt={screen.name} />
        ) : (
          <div className={refStyles.screenThumbPlaceholder}>loading…</div>
        )}
      </button>
      <div className={refStyles.screenMeta}>
        <div className={refStyles.screenName}>{screen.name}</div>
        <div className={refStyles.screenArchetype}>
          {screen.archetype} · {screen.context}
        </div>
      </div>
      <div className={refStyles.screenActions}>
        <Badge
          size="s"
          attention="medium"
          appearance={
            screen.status === 'approved'
              ? 'positive'
              : screen.status === 'archived'
                ? 'neutral'
                : 'warning'
          }
        >
          {screen.status}
        </Badge>
        <Button attention="low" appearance="negative" size="xs" onPress={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function ScreenDetail({
  screen,
  onClose,
  onSave,
}: {
  screen: ReferenceScreenRow;
  onClose: () => void;
  onSave: (patch: {
    name?: string;
    archetype?: string;
    context?: (typeof CONTEXTS)[number];
    description?: string;
    status?: 'draft' | 'approved' | 'archived';
  }) => Promise<unknown>;
}) {
  const [name, setName] = useState(screen.name);
  const [archetype, setArchetype] = useState(screen.archetype);
  const [context, setContext] = useState(screen.context);
  const [description, setDescription] = useState(screen.description ?? '');
  const [status, setStatus] = useState(screen.status);
  const [analyzing, setAnalyzing] = useState(false);
  const [removingAnalysis, setRemovingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editingAnalysis, setEditingAnalysis] = useState(false);
  const [analysisDraft, setAnalysisDraft] = useState('');
  const detailRef = useRef<HTMLDivElement>(null);
  const clearAnalysis = useMutation(api.referenceAnalyses.clearForScreen);
  const patchAnalysisSummary = useMutation(api.referenceAnalyses.patchSummary);

  // When the detail becomes visible (ID changed), scroll it into view so the
  // user isn't confused by the card landing below the thumbnail grid.
  useEffect(() => {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [screen._id]);

  // Keep local edit state synced when a different screen is selected.
  useEffect(() => {
    setName(screen.name);
    setArchetype(screen.archetype);
    setContext(screen.context);
    setDescription(screen.description ?? '');
    setStatus(screen.status);
    setAnalysisError(null);
  }, [screen._id, screen.name, screen.archetype, screen.context, screen.description, screen.status]);

  const url = useQuery(api.references.getStorageUrl, {
    storageId: screen.storageId,
  }) as string | null | undefined;

  const latestAnalysis = useQuery(api.referenceAnalyses.latestForScreen, {
    screenId: screen._id,
  }) as { _id: Id<'referenceAnalyses'>; summary?: string } | null | undefined;

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/reference/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId: screen._id, force: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data?.error ?? `Analysis failed (${res.status})`);
      } else if (data?.autoApproved) {
        setStatus('approved');
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  }, [screen._id]);

  const handleRemoveAnalysis = useCallback(async () => {
    if (!confirm('Remove the cached analysis for this screen? Status will revert to draft.')) return;
    setRemovingAnalysis(true);
    try {
      await clearAnalysis({ screenId: screen._id, revertToDraft: true });
      setStatus('draft');
    } finally {
      setRemovingAnalysis(false);
    }
  }, [clearAnalysis, screen._id]);

  return (
    <div ref={detailRef}>
    <FoundationCard
      title={`Screen: ${screen.name}`}
      description="Edit metadata, review the LLM analysis, or approve for production use."
      actions={
        <Button attention="low" appearance="neutral" size="xs" onPress={onClose}>
          Close
        </Button>
      }
    >
      <div className={refStyles.screenDetailGrid}>
        <div className={refStyles.screenDetailImage}>
          {url ? (
            <img src={url} alt={screen.name} />
          ) : (
            <div className={refStyles.screenThumbPlaceholder}>loading…</div>
          )}
        </div>
        <div>
          <div className={styles.propertyList}>
            <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
              <span className={styles.propertyLabel}>Name</span>
              <Input value={name} onChange={setName} />
            </div>
            <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
              <span className={styles.propertyLabel}>Archetype</span>
              <Input value={archetype} onChange={setArchetype} />
            </div>
            <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
              <span className={styles.propertyLabel}>Context</span>
              <Select
                value={context}
                onChange={(v) => setContext(v as typeof context)}
                options={CONTEXTS.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
              <span className={styles.propertyLabel}>Status</span>
              <Select
                value={status}
                onChange={(v) => setStatus(v as typeof status)}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
            <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
              <span className={styles.propertyLabel}>Description</span>
              <textarea
                className={styles.ruleTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)' }}>
            <Button
              attention="high"
              size="s"
              onPress={() => onSave({ name, archetype, context, description, status })}
            >
              Save
            </Button>
            <Button attention="medium" size="s" onPress={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Analysing…' : 'Re-run analysis'}
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--Spacing-3-5)' }}>
          <div>
            <div style={{ fontSize: 'var(--Label-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Medium)' }}>
              LLM Analysis
            </div>
            <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginTop: 'var(--Spacing-1-5)' }}>
              Claude&rsquo;s OneUI-vocabulary readout. This is what the agent reads at generation time — the designer description above is only UI metadata.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
            {latestAnalysis && !editingAnalysis && (
              <>
                <Button
                  attention="low"
                  appearance="neutral"
                  size="xs"
                  onPress={() => {
                    const md = [
                      `## Reference: ${screen.name}`,
                      '',
                      `- Archetype: ${screen.archetype}`,
                      `- Context: ${screen.context}`,
                      ...(screen.description ? [`- Description: ${screen.description}`] : []),
                      '',
                      latestAnalysis.summary ?? '',
                    ].join('\n');
                    navigator.clipboard.writeText(md);
                  }}
                >
                  Copy as Markdown
                </Button>
                <Button
                  attention="low"
                  appearance="neutral"
                  size="xs"
                  onPress={() => {
                    setAnalysisDraft(latestAnalysis.summary ?? '');
                    setEditingAnalysis(true);
                  }}
                >
                  Edit
                </Button>
              </>
            )}
            {latestAnalysis && (
              <Button
                attention="low"
                appearance="negative"
                size="xs"
                onPress={handleRemoveAnalysis}
                disabled={removingAnalysis}
              >
                {removingAnalysis ? 'Removing…' : 'Remove'}
              </Button>
            )}
          </div>
        </div>
        {editingAnalysis && latestAnalysis ? (
          <>
            <textarea
              className={styles.ruleTextarea}
              value={analysisDraft}
              onChange={(e) => setAnalysisDraft(e.target.value)}
              rows={14}
            />
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-3-5)' }}>
              <Button
                attention="high"
                size="xs"
                onPress={async () => {
                  await patchAnalysisSummary({
                    id: latestAnalysis._id,
                    summary: analysisDraft,
                  });
                  setEditingAnalysis(false);
                }}
              >
                Save edits
              </Button>
              <Button
                attention="low"
                appearance="neutral"
                size="xs"
                onPress={() => setEditingAnalysis(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className={refStyles.analysisBox}>
            {analysisError
              ? `Analysis error: ${analysisError}`
              : analyzing
                ? 'Analysing with Claude vision…'
                : latestAnalysis?.summary ??
                  'No analysis yet. Upload auto-triggers one; use "Re-run analysis" to refresh after the image changes.'}
          </div>
        )}
      </div>
    </FoundationCard>
    </div>
  );
}
