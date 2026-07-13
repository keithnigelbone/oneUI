/**
 * CanvasWorkspace — Standalone canvas accessible from the Create side panel.
 * Opens directly into ExperienceCanvas. On save, creates a new project + asset
 * in Convex and navigates to the project workspace.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { migrateLegacyPlatformsConfig, type PlatformsFoundationConfig } from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useRouter } from 'next/navigation';
import { Button } from '@oneui/ui/components/Button';
import {
  ExperienceCanvas,
  getPrimaryFrameId,
  type ArtboardSubBrandOption,
  type Editor,
} from '@/design-tools/ExperienceCanvas';
import { editorGetSnapshot } from '../lib/tldrawStoreApi';
import { CREATE_ARTBOARD_PRESETS } from '../lib/createArtboardPresets';
import styles from './CanvasWorkspace.module.css';

export default function CanvasWorkspace() {
  const { currentBrand, theme } = usePlatformContext();
  const router = useRouter();

  const [editor, setEditor] = useState<Editor | null>(null);
  const [assetName, setAssetName] = useState('Untitled Asset');
  const [saving, setSaving] = useState(false);

  // Convex mutations
  const createProject = useMutation(api.createProjects.create);
  const createAsset = useMutation(api.createProjects.createAsset);
  const updateAsset = useMutation(api.createProjects.updateAsset);
  const generateUploadUrl = useMutation(api.createProjects.generateUploadUrl);

  // Sub-brands for per-frame artboard theming
  const subBrandsForCreate = useQuery(
    api.subBrandConfigs.getByParentBrand,
    currentBrand?.id ? { parentBrandId: currentBrand.id as Id<'brands'> } : 'skip',
  );

  const artboardSubBrandOptions: ArtboardSubBrandOption[] = useMemo(() => {
    if (!subBrandsForCreate?.length) return [];
    return subBrandsForCreate.map((s) => ({
      id: s._id,
      name: s.name,
      slug: s.slug,
      parentBrandId: s.parentBrandId,
      primary: s.primary,
      secondary: s.secondary,
      sparkle: s.sparkle,
      brandBg: s.brandBg,
    }));
  }, [subBrandsForCreate]);

  // Platform foundation data for the canvas
  const platformOverview = useQuery(
    api.foundations.getBrandOverviewData,
    currentBrand?.id ? { brandId: currentBrand.id as Id<'brands'> } : 'skip',
  );

  const foundationPlatformEntries = useMemo(() => {
    const raw = platformOverview?.platforms?.config as PlatformsFoundationConfig | undefined;
    if (!raw) return [];
    const cfg = migrateLegacyPlatformsConfig(raw);
    return cfg.platforms;
  }, [platformOverview]);

  const onEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  /**
   * Save flow:
   * 1. Export the primary frame to PNG
   * 2. Create a new project in Convex
   * 3. Create an asset under the project
   * 4. Upload the PNG and update the asset
   * 5. Navigate to the project workspace
   */
  const handleSave = useCallback(async () => {
    if (!editor || saving || !currentBrand?.id) return;
    setSaving(true);

    try {
      const frameId = getPrimaryFrameId(editor);
      if (!frameId) {
        console.warn('[CanvasWorkspace] No frame to export');
        setSaving(false);
        return;
      }

      // Export PNG
      editor.select(frameId as never);
      const result = await editor.toImage([frameId as never], { scale: 2, background: true });
      if (!result) {
        setSaving(false);
        return;
      }
      const pngBlob = 'blob' in result ? result.blob : (result as Blob);

      // Get frame dimensions for asset metadata
      const shape = editor.getShape(frameId as never) as
        | { props?: { w?: number; h?: number; name?: string } }
        | undefined;
      const width = Math.round(shape?.props?.w ?? 1080);
      const height = Math.round(shape?.props?.h ?? 1080);
      const dimensionName = shape?.props?.name ?? `${width}×${height}`;

      // Serialize tldraw snapshot
      const snapshot = JSON.stringify(editorGetSnapshot(editor));

      const name = assetName.trim() || 'Untitled Asset';
      const brandId = currentBrand.id as Id<'brands'>;

      // 1. Create project
      const projectId = await createProject({
        brandId,
        name,
        type: 'single',
        platforms: ['instagram'],
      });

      // 2. Create asset
      const assetId = await createAsset({
        projectId,
        brandId,
        name: dimensionName,
        platform: 'instagram',
        dimensionName,
        width,
        height,
        category: 'post',
        html: '',
        css: '',
        imageSlots: [],
        tldrawSnapshot: snapshot,
        status: 'capturing',
      });

      // 3. Upload PNG
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: pngBlob,
      });
      const { storageId } = await uploadRes.json();

      // 4. Update asset with image
      await updateAsset({
        assetId,
        status: 'ready',
        capturedImageStorageId: storageId,
        tldrawSnapshot: snapshot,
      });

      // 5. Navigate to the new project
      router.push(`/create/projects/${projectId}`);
    } catch (e) {
      console.error('[CanvasWorkspace] save failed', e);
      setSaving(false);
    }
  }, [
    editor,
    saving,
    currentBrand?.id,
    assetName,
    createProject,
    createAsset,
    generateUploadUrl,
    updateAsset,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.push('/create/projects');
  }, [router]);

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <input
            className={styles.nameInput}
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Asset name…"
            disabled={saving}
            onFocus={(e) => e.target.select()}
          />
          <span className={styles.dimensionBadge}>New canvas</span>
        </div>
        <div className={styles.toolbarSpacer} />
        <div className={styles.toolbarActions}>
          <Button attention="low" appearance="neutral" onPress={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            attention="high"
            onPress={() => void handleSave()}
            disabled={saving || !editor || !currentBrand?.id}
          >
            {saving ? 'Saving…' : 'Save as Project'}
          </Button>
        </div>
      </header>

      <div className={styles.canvasWrap}>
        <ExperienceCanvas
          artboardPresets={CREATE_ARTBOARD_PRESETS}
          foundationPlatforms={foundationPlatformEntries}
          availableSubBrands={artboardSubBrandOptions}
          brandFoundationDataForSubBrands={
            platformOverview as Record<string, unknown> | null | undefined
          }
          mode={theme}
          onEditorReady={onEditorReady}
          canvasBackground="neutral"
        />
      </div>

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingContent}>
            <div className={styles.spinner} />
            <span className={styles.savingText}>Creating project…</span>
          </div>
        </div>
      )}
    </div>
  );
}
