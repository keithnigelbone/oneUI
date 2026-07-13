/**
 * foundations/platforms/page.tsx
 *
 * Density & Platforms Foundation - configures breakpoints, density, and DIN 1450
 * platform parameters per brand. Each platform is an expandable row showing all
 * its settings inline (DIN 1450 params, breakpoints, density).
 *
 * Other foundations (Typography, Dimension, Spacing) read platform params directly
 * from this foundation via Convex queries — no manual sync needed.
 */

'use client';

import { useState, useCallback, useEffect, useRef, startTransition } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  buildDefaultPlatformsConfig,
  buildCustomPlatformEntry,
  migrateLegacyPlatformsConfig,
} from '@oneui/shared';
import type { PlatformsFoundationConfig, PlatformEntry } from '@oneui/shared';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { PlatformList } from '@/design-tools/Foundations/Platforms';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';

const DEFAULT_CONFIG = buildDefaultPlatformsConfig();

export default function PlatformsFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // Fetch existing foundation from Convex
  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'platforms' as const } : 'skip'
  );

  // Local state
  const [config, setConfig] = useState<PlatformsFoundationConfig>(DEFAULT_CONFIG);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-save to Convex
  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'platforms',
    enabled: hasInitialized,
  });

  // Track previous brandId for reset
  const prevBrandIdRef = useRef<string | undefined>(brandId);

  // Initialize from Convex + reset on brand change
  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      startTransition(() => {
        setHasInitialized(false);
      });
      return;
    }

    if (existingFoundation?.config && !hasInitialized) {
      const loadedConfig = existingFoundation.config as PlatformsFoundationConfig;
      // Fold any legacy printA4/printBusinessCard entries into a unified `print`
      // platform and backfill missing category/breakpointSelectionMode on older
      // stored configs. Idempotent — safe to run on already-migrated data.
      const migratedConfig = migrateLegacyPlatformsConfig(loadedConfig);
      startTransition(() => {
        setConfig(migratedConfig);
        setHasInitialized(true);
      });
    } else if (existingFoundation === null && !hasInitialized) {
      startTransition(() => {
        setHasInitialized(true);
      });
    }
  }, [existingFoundation, hasInitialized, brandId]);

  // Update a single platform in the config
  const handleUpdatePlatform = useCallback((updated: PlatformEntry) => {
    setConfig((prev) => ({
      ...prev,
      platforms: prev.platforms.map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
  }, []);

  // Toggle platform enabled
  const handleTogglePlatform = useCallback(
    (id: string, enabled: boolean) => {
      setConfig((prev) => ({
        ...prev,
        platforms: prev.platforms.map((p) =>
          p.id === id ? { ...p, isEnabled: enabled } : p
        ),
      }));
    },
    []
  );

  // Rename a platform
  const handleRenamePlatform = useCallback(
    (id: string, newLabel: string) => {
      setConfig((prev) => ({
        ...prev,
        platforms: prev.platforms.map((p) =>
          p.id === id ? { ...p, label: newLabel } : p
        ),
      }));
    },
    []
  );

  // Delete a platform (cannot delete default or last)
  const handleDeletePlatform = useCallback(
    (id: string) => {
      setConfig((prev) => {
        if (prev.platforms.length <= 1) return prev;
        if (id === prev.defaultPlatform) return prev;
        return {
          ...prev,
          platforms: prev.platforms.filter((p) => p.id !== id),
        };
      });
    },
    []
  );

  // Add a custom platform
  const handleAddPlatform = useCallback(() => {
    setConfig((prev) => {
      const existingIds = new Set(prev.platforms.map((p) => p.id));
      let counter = 1;
      let id = `custom-${counter}`;
      while (existingIds.has(id)) {
        counter++;
        id = `custom-${counter}`;
      }
      const newPlatform = buildCustomPlatformEntry(id, `Custom Platform ${counter}`);
      return {
        ...prev,
        platforms: [...prev.platforms, newPlatform],
      };
    });
  }, []);

  // True while we're still waiting for brand + Convex data
  const isLoading = !hasInitialized;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Density & Platforms</h1>
        <p className={styles.description}>
          Configure platforms, breakpoints, and density per brand.
          Other foundations read these settings directly from Convex.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.tabPanelStack}>
          <FoundationCard
            title="Platform Configuration"
            description="Toggle platform support, manage breakpoints, and configure density for each platform."
          >
            {isLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--Spacing-5) var(--Spacing-4)',
                  color: 'var(--Text-Low)',
                  fontSize: 'var(--Body-S-FontSize)',
                }}
              >
                Loading platforms...
              </div>
            ) : (
              <PlatformList
                platforms={config.platforms}
                defaultPlatformId={config.defaultPlatform}
                onUpdatePlatform={handleUpdatePlatform}
                onTogglePlatform={handleTogglePlatform}
                onRenamePlatform={handleRenamePlatform}
                onDeletePlatform={handleDeletePlatform}
                onAddPlatform={handleAddPlatform}
              />
            )}
          </FoundationCard>
        </div>
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--Spacing-4-5)',
            right: 'var(--Spacing-4-5)',
            padding: 'var(--Spacing-3-5) var(--Spacing-4)',
            backgroundColor: 'var(--Surface-Bold)',
            color: 'var(--Text-OnBold-High)',
            borderRadius: 'var(--Shape-Pill)',
            fontSize: 'var(--Typography-Size-XS)',
            opacity: 0.9,
          }}
        >
          Saving...
        </div>
      )}
    </div>
  );
}
