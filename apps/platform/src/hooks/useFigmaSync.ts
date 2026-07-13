/**
 * useFigmaSync.ts
 *
 * Hook for managing Figma sync operations
 */

'use client';

import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@oneui/convex';
import { useState, useCallback, useMemo } from 'react';
import type { SyncPreviewData, TokenDiff, ModeMapping } from '@oneui/shared';

export interface UseFigmaSyncOptions {
  brandId: string | null;
}

export interface UseFigmaSyncReturn {
  /** Current sync preview data */
  preview: SyncPreviewData | null;
  /** Whether a preview is being generated */
  isLoadingPreview: boolean;
  /** Whether changes are being applied */
  isApplying: boolean;
  /** Error message (if any) */
  error: string | null;
  /** Sync history for this brand */
  syncHistory: Array<{
    id: string;
    tokensAdded: number;
    tokensUpdated: number;
    tokensRemoved: number;
    status: string;
    syncedAt: number;
  }>;
  /** Generate a sync preview */
  generatePreview: (options?: {
    modeMappings?: ModeMapping[];
    collectionFilter?: string[];
  }) => Promise<void>;
  /** Apply all changes from preview */
  applyAll: () => Promise<void>;
  /** Apply selected changes from preview */
  applySelected: (selection: {
    addedNames?: string[];
    modifiedIds?: string[];
    removedIds?: string[];
  }) => Promise<void>;
  /** Clear the preview */
  clearPreview: () => void;
  /** Clear any error */
  clearError: () => void;
}

/**
 * Hook for managing Figma sync operations
 */
export function useFigmaSync({
  brandId,
}: UseFigmaSyncOptions): UseFigmaSyncReturn {
  // Local state
  const [preview, setPreview] = useState<SyncPreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query sync history
  const syncHistoryData = useQuery(
    api.syncHistory.listByBrand,
    brandId ? { brandId: brandId as any, limit: 10 } : 'skip'
  );

  // Actions and mutations
  const generatePreviewAction = useAction(api.figmaSync.generatePreview);
  const syncMutation = useMutation(api.tokens.sync);
  const updateLastSyncMutation = useMutation(api.figmaConnections.updateLastSync);

  // Get connection for file info
  const connection = useQuery(
    api.figmaConnections.getByBrand,
    brandId ? { brandId: brandId as any } : 'skip'
  );

  const syncHistory = useMemo(
    () =>
      (syncHistoryData ?? []).map((h: any) => ({
        id: h._id as string,
        tokensAdded: h.tokensAdded,
        tokensUpdated: h.tokensUpdated,
        tokensRemoved: h.tokensRemoved,
        status: h.status,
        syncedAt: h.syncedAt,
      })),
    [syncHistoryData]
  );

  /**
   * Generate a sync preview
   */
  const generatePreview = useCallback(
    async (options?: {
      modeMappings?: ModeMapping[];
      collectionFilter?: string[];
    }) => {
      if (!brandId) {
        setError('No brand selected');
        return;
      }

      setIsLoadingPreview(true);
      setError(null);

      try {
        const result = await generatePreviewAction({
          brandId: brandId as any,
          modeMappings: options?.modeMappings,
          collectionFilter: options?.collectionFilter,
        });
        setPreview(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate preview';
        setError(message);
        setPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [brandId, generatePreviewAction]
  );

  /**
   * Apply all changes from preview
   */
  const applyAll = useCallback(async () => {
    if (!brandId || !preview) {
      setError('No preview available');
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      await syncMutation({
        brandId: brandId as any,
        tokensToAdd: preview.diff.added.map((t) => ({
          name: t.name,
          category: t.category,
          value: t.value,
          mode: t.mode,
          description: t.description,
          figmaId: t.figmaId,
          figmaKey: t.figmaKey,
        })),
        tokensToUpdate: preview.diff.modified.map((t) => ({
          id: t.id as any,
          value: t.newValue,
          description: t.description,
        })),
        tokensToRemove: preview.diff.removed.map((t) => t.id as any),
        sourceDetails: connection
          ? {
              fileKey: connection.fileKey,
              fileName: connection.fileName,
            }
          : undefined,
        syncedBy: 'current-user', // TODO: Get from auth context
      });

      // Update last sync time
      await updateLastSyncMutation({
        brandId: brandId as any,
      });

      // Clear preview after successful sync
      setPreview(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to apply changes';
      setError(message);
    } finally {
      setIsApplying(false);
    }
  }, [
    brandId,
    preview,
    syncMutation,
    updateLastSyncMutation,
    connection,
  ]);

  /**
   * Apply selected changes from preview
   */
  const applySelected = useCallback(
    async (selection: {
      addedNames?: string[];
      modifiedIds?: string[];
      removedIds?: string[];
    }) => {
      if (!brandId || !preview) {
        setError('No preview available');
        return;
      }

      setIsApplying(true);
      setError(null);

      try {
        // Filter to selected items
        const tokensToAdd = preview.diff.added.filter((t) =>
          selection.addedNames?.includes(`${t.name}:${t.mode}`)
        );
        const tokensToUpdate = preview.diff.modified.filter((t) =>
          selection.modifiedIds?.includes(t.id)
        );
        const tokensToRemove = preview.diff.removed.filter((t) =>
          selection.removedIds?.includes(t.id)
        );

        await syncMutation({
          brandId: brandId as any,
          tokensToAdd: tokensToAdd.map((t) => ({
            name: t.name,
            category: t.category,
            value: t.value,
            mode: t.mode,
            description: t.description,
            figmaId: t.figmaId,
            figmaKey: t.figmaKey,
          })),
          tokensToUpdate: tokensToUpdate.map((t) => ({
            id: t.id as any,
            value: t.newValue,
            description: t.description,
          })),
          tokensToRemove: tokensToRemove.map((t) => t.id as any),
          sourceDetails: connection
            ? {
                fileKey: connection.fileKey,
                fileName: connection.fileName,
              }
            : undefined,
          syncedBy: 'current-user',
        });

        // Update last sync time
        await updateLastSyncMutation({
          brandId: brandId as any,
        });

        // Re-generate preview to show remaining changes
        await generatePreview();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to apply selected changes';
        setError(message);
      } finally {
        setIsApplying(false);
      }
    },
    [
      brandId,
      preview,
      syncMutation,
      updateLastSyncMutation,
      connection,
      generatePreview,
    ]
  );

  /**
   * Clear the preview
   */
  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      preview,
      isLoadingPreview,
      isApplying,
      error,
      syncHistory,
      generatePreview,
      applyAll,
      applySelected,
      clearPreview,
      clearError,
    }),
    [
      preview,
      isLoadingPreview,
      isApplying,
      error,
      syncHistory,
      generatePreview,
      applyAll,
      applySelected,
      clearPreview,
      clearError,
    ]
  );
}
