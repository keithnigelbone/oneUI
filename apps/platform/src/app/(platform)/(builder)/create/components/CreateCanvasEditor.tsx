'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExperienceCanvas,
  type ArtboardPreset,
  type ArtboardSubBrandOption,
  type Editor,
} from '@/design-tools/ExperienceCanvas';
import { editorGetSnapshot, editorLoadSnapshot } from '../lib/tldrawStoreApi';
import {
  clearTopLevelShapes,
  createMarketingFrame,
  getPrimaryFrameId,
  migrateFullBleedShapes,
} from '@/design-tools/ExperienceCanvas';
import { Button } from '@oneui/ui/components/Button';
import type { PlatformEntry } from '@oneui/shared';
import type { CampaignAsset } from '../lib/types';
import styles from './CreateCanvasEditor.module.css';

export interface CreateCanvasEditorProps {
  asset: CampaignAsset;
  artboardPresets: ArtboardPreset[];
  /** Enabled Density & Platforms entries (platform brand) for ContentBlock token mapping. */
  foundationPlatforms?: readonly PlatformEntry[];
  /** Sub-brands for per-frame artboard theming */
  availableSubBrands?: readonly ArtboardSubBrandOption[];
  /** Raw brand overview (no TopBar sub-brand merge) for scoped artboard CSS */
  brandFoundationDataForSubBrands?: Record<string, unknown> | null;
  theme?: 'light' | 'dark';
  contextInfo?: string;
  onSave: (assetId: string, snapshot: string, pngBlob: Blob) => void | Promise<void>;
  onCancel: () => void;
}

export function CreateCanvasEditor({
  asset,
  artboardPresets,
  foundationPlatforms,
  availableSubBrands,
  brandFoundationDataForSubBrands,
  theme = 'light',
  contextInfo,
  onSave,
  onCancel,
}: CreateCanvasEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);

  const onEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  useEffect(() => {
    if (!editor) return;
    const key = `${asset.id}:${asset.tldrawSnapshot ?? ''}:${asset.updatedAt}`;
    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;

    try {
      if (asset.tldrawSnapshot) {
        editorLoadSnapshot(editor, JSON.parse(asset.tldrawSnapshot));
        migrateFullBleedShapes(editor);
      } else {
        clearTopLevelShapes(editor);
        createMarketingFrame(editor, {
          w: asset.dimension.width,
          h: asset.dimension.height,
          name: asset.name,
        });
      }
      requestAnimationFrame(() => {
        editor.zoomToFit({ animation: { duration: 0 } });
      });
    } catch (e) {
      console.error('[CreateCanvasEditor] load snapshot failed', e);
      clearTopLevelShapes(editor);
      createMarketingFrame(editor, {
        w: asset.dimension.width,
        h: asset.dimension.height,
        name: asset.name,
      });
    }
  }, [editor, asset.id, asset.tldrawSnapshot, asset.updatedAt, asset.dimension, asset.name]);

  const handleSave = useCallback(async () => {
    if (!editor || saving) return;
    setSaving(true);
    try {
      const frameId = getPrimaryFrameId(editor);
      if (!frameId) {
        console.warn('[CreateCanvasEditor] No frame to export');
        return;
      }
      editor.select(frameId as never);
      const result = await editor.toImage([frameId as never], { scale: 2, background: true });
      if (!result) return;
      const blob = 'blob' in result ? result.blob : (result as Blob);
      const snapshot = JSON.stringify(editorGetSnapshot(editor));
      await onSave(asset.id, snapshot, blob);
    } catch (e) {
      console.error('[CreateCanvasEditor] save failed', e);
    } finally {
      setSaving(false);
    }
  }, [editor, saving, onSave, asset.id]);

  return (
    <div className={styles.overlay} role="dialog" aria-label="Canvas editor">
      <header className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <h2 className={styles.assetTitle}>{asset.name}</h2>
          <span className={styles.dimensionBadge}>
            {asset.dimension.name} · {asset.dimension.width}×{asset.dimension.height}
          </span>
        </div>
        {contextInfo ? <span className={styles.contextInfo}>{contextInfo}</span> : null}
        <div className={styles.toolbarSpacer} />
        <Button attention="low" appearance="neutral" onPress={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button attention="high" onPress={() => void handleSave()} disabled={saving || !editor}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </header>
      <div className={styles.canvasWrap}>
        <ExperienceCanvas
          artboardPresets={artboardPresets}
          foundationPlatforms={foundationPlatforms}
          availableSubBrands={availableSubBrands}
          brandFoundationDataForSubBrands={brandFoundationDataForSubBrands}
          mode={theme}
          onEditorReady={onEditorReady}
          canvasBackground="neutral"
        />
      </div>
    </div>
  );
}
