/**
 * foundations/elevation/page.tsx
 *
 * Elevation Foundation - Two-shadow formula and dark mode adjustments
 * Integrates with Convex for multi-brand configuration persistence
 */

'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  generateAllElevations,
  getElevationUsage,
  type ElevationConfig,
  type ElevationLevel,
} from '@oneui/shared';
import { elevationLevelToBoxShadow } from '@oneui/shared/engine';
import { FoundationCard, SliderControl } from '@/design-tools/Foundations/shared';
import { Tabs } from '@oneui/ui/components/Tabs';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';
import elevationStyles from './elevation.module.css';

interface ElevationFoundationConfig {
  levels: ElevationConfig[];
  baseOpacity: number;
  darkModeMultiplier: number;
}

const DEFAULT_ELEVATION_CONFIG: ElevationFoundationConfig = {
  levels: generateAllElevations('low'),
  baseOpacity: 0.08,
  darkModeMultiplier: 1.5,
};

export default function ElevationFoundationPage() {
  const { currentBrand, theme } = usePlatformContext();

  // Brand ID from context (always a valid Convex ID after initialization)
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'elevation' as const } : 'skip'
  );

  const [config, setConfig] = useState<ElevationFoundationConfig>(DEFAULT_ELEVATION_CONFIG);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'formula'>('levels');

  // Auto-save to Convex with debouncing
  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'elevation',
    enabled: hasInitialized,
  });

  const isDarkMode = theme === 'dark';

  // Regenerate levels when opacity changes
  const elevationLevels = useMemo(() => {
    const surfaceBrightness = isDarkMode ? 'high' : 'low';
    return generateAllElevations(surfaceBrightness);
  }, [isDarkMode]);

  // Initialize from Convex — combined with brand-reset to avoid race condition
  // where both effects fire on mount with warm cache, React batches setState,
  // and hasInitialized gets stuck as false.
  const prevBrandIdRef = useRef(brandId);

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setHasInitialized(false);
      return;
    }

    if (existingFoundation?.config && !hasInitialized) {
      const loadedConfig = existingFoundation.config as ElevationFoundationConfig;
      setConfig(loadedConfig);
      setHasInitialized(true);
    } else if (existingFoundation === null && !hasInitialized) {
      setConfig(prev => ({ ...prev, levels: elevationLevels }));
      setHasInitialized(true);
    }
  }, [existingFoundation, hasInitialized, elevationLevels, brandId]);

  const handleOpacityChange = useCallback((value: number) => {
    setConfig(prev => ({
      ...prev,
      baseOpacity: value,
    }));
  }, []);

  const handleDarkModeMultiplierChange = useCallback((value: number) => {
    setConfig(prev => ({
      ...prev,
      darkModeMultiplier: value,
    }));
  }, []);

  const isLoading = brandId != null && existingFoundation === undefined;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Elevation Foundation</h1>
        <p className={styles.description}>
          Configure 6-level elevation system with mathematically-derived shadow values.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.foundationTabsRow}>
          <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as 'levels' | 'formula') ?? 'levels')}
          >
            <Tabs.List className={styles.foundationTabsList}>
              <Tabs.Item value="levels">Levels</Tabs.Item>
              <Tabs.Item value="formula">Formula</Tabs.Item>
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className={styles.tabPanelStack}>
        {/* Elevation Levels Preview */}
        {activeTab === 'levels' && (
        <FoundationCard
          title="Elevation Levels"
          description="Adjust shadow settings and preview all 6 elevation levels (0-5) in one place."
        >
          <div className={elevationStyles.workbench}>
            <div className={elevationStyles.settingsPanel}>
              <SliderControl
                label="Base Opacity"
                value={config.baseOpacity}
                min={0.02}
                max={0.2}
                step={0.02}
                onChange={handleOpacityChange}
                disabled={isLoading}
              />
              <SliderControl
                label="Dark Mode Multiplier"
                value={config.darkModeMultiplier}
                min={1}
                max={3}
                step={0.25}
                unit="x"
                onChange={handleDarkModeMultiplierChange}
                disabled={isLoading}
              />
            </div>

            <div className={elevationStyles.levelTable}>
              <div className={`${elevationStyles.levelRow} ${elevationStyles.levelHeader}`}>
                <span>Level</span>
                <span>Preview</span>
                <span>Usage</span>
              </div>
              {elevationLevels.map((level) => (
                <div key={level.level} className={elevationStyles.levelRow}>
                  <code className={elevationStyles.levelName}>Level {level.level}</code>
                  <div
                    className={elevationStyles.previewCard}
                    style={{
                      boxShadow: elevationLevelToBoxShadow(level, {
                        isDarkMode,
                        baseOpacity: config.baseOpacity,
                        darkModeMultiplier: config.darkModeMultiplier,
                      }),
                    }}
                  >
                    <span>Card</span>
                  </div>
                  <div className={elevationStyles.usageText}>
                    {getElevationUsage(level.level as ElevationLevel)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FoundationCard>
        )}

        {/* Two-Shadow Formula */}
        {activeTab === 'formula' && (
        <FoundationCard
          title="Two-Shadow Formula"
          description="Understanding the elevation calculation."
        >
          <div className={styles.infoBox}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <div className={styles.infoText}>
              <p>Each elevation level uses two shadows:</p>
              <ul style={{ marginTop: 'var(--Spacing-3-5)', paddingLeft: 'var(--Spacing-4-5)' }}>
                <li><strong>Key Light:</strong> y-offset = f × 0.5, blur = f</li>
                <li><strong>Ambient Light:</strong> y-offset = f × 0.25, blur = f + 6</li>
              </ul>
              <p style={{ marginTop: 'var(--Spacing-3-5)' }}>Where f(level) = level^1.5 × 2</p>
              <p style={{ marginTop: 'var(--Spacing-3-5)' }}>
                In dark mode, a 1px white stroke is added for edge definition.
              </p>
            </div>
          </div>
        </FoundationCard>
        )}
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
