/**
 * foundations/icons/page.tsx
 *
 * Icons Foundation - Icon set selection and configuration
 * Allows brands to select from 8 icon libraries including Tira and Material Symbols
 */

'use client';

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { IconSetCard } from '@/design-tools/Foundations/Icons';
import { Tabs } from '@oneui/ui/components/Tabs';
import { Select } from '@oneui/ui/components/Select';
import { IconSetRegistry, getIconSetIds } from '@oneui/ui/icons/IconRegistry';
import type {
  IconSetId,
  IconSize,
  IconFoundationConfig,
  IconVariantPreference,
  MaterialStylePreference,
} from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import { ensureJioIconCatalogLoaded } from '@/lib/initJioIcons';
import styles from '../foundation.module.css';
import iconStyles from './icons.module.css';

const PAGE_NAME = 'IconsFoundationPage';

// Lazy load IconBrowser - it's a heavy component that loads thousands of icons
const IconBrowser = lazy(() =>
  import('@/design-tools/Foundations/Icons/IconBrowser').then((mod) => ({
    default: mod.IconBrowser,
  }))
);

// Loading placeholder for IconBrowser
const IconBrowserSkeleton = () => (
  <div className={iconStyles.browserSkeleton}>Loading icons...</div>
);

const SIZE_OPTIONS: { value: IconSize; label: string; pixels: number }[] = [
  { value: 'xs', label: 'Extra small', pixels: 12 },
  { value: 'sm', label: 'Small', pixels: 16 },
  { value: 'md', label: 'Medium', pixels: 20 },
  { value: 'lg', label: 'Large', pixels: 24 },
  { value: 'xl', label: 'Extra large', pixels: 32 },
];

const STROKE_WIDTH_OPTIONS = [1, 1.5, 2, 2.5, 3].map((value) => ({
  value,
  label: `${value}px`,
}));

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const VARIANT_OPTIONS: { value: IconVariantPreference; label: string }[] = [
  { value: 'outline', label: 'Outline' },
  { value: 'filled', label: 'Filled' },
];

const MATERIAL_STYLE_OPTIONS: { value: MaterialStylePreference; label: string }[] = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'sharp', label: 'Sharp' },
];

const DEFAULT_ICON_CONFIG: IconFoundationConfig = {
  selectedSet: 'jio',
  defaultSize: 'md',
  strokeWidth: 2,
  variant: 'outline',
  materialStyle: 'outlined',
};

export default function IconsFoundationPage() {
  const { currentBrand, setIconSet, setIconVariant, setMaterialStyle } = usePlatformContext();

  // Brand ID from context (always a valid Convex ID after initialization)
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'icons' as const } : 'skip'
  );

  const [config, setConfig] = useState<IconFoundationConfig>(DEFAULT_ICON_CONFIG);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'details'>('browse');

  // Auto-save to Convex with debouncing
  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'icons',
    enabled: hasInitialized,
  });

  // Initialize from Convex — combined with brand-reset to avoid race condition
  const prevBrandIdRef = useRef(brandId);

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setHasInitialized(false);
      return;
    }

    if (existingFoundation?.config && !hasInitialized) {
      const loadedConfig = existingFoundation.config as IconFoundationConfig;
      setConfig(loadedConfig);
      setHasInitialized(true);
    } else if (existingFoundation === null && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [existingFoundation, hasInitialized, brandId]);

  const handleIconSetSelect = useCallback(
    (setId: IconSetId) => {
      const metadata = IconSetRegistry[setId];
      setConfig((prev) => ({
        ...prev,
        selectedSet: setId,
        strokeWidth: metadata.supportsStrokeWidth ? (metadata.defaultStrokeWidth ?? 2) : undefined,
        variant: metadata.style === 'mixed' ? (prev.variant ?? 'outline') : undefined,
        materialStyle: setId === 'material' ? (prev.materialStyle ?? 'outlined') : undefined,
      }));
      setIconSet(setId);
    },
    [setIconSet]
  );

  const handleVariantSelect = useCallback(
    (variant: IconVariantPreference) => {
      setConfig((prev) => ({ ...prev, variant }));
      setIconVariant(variant);
    },
    [setIconVariant],
  );

  const handleMaterialStyleSelect = useCallback(
    (materialStyle: MaterialStylePreference) => {
      setConfig((prev) => ({ ...prev, materialStyle }));
      setMaterialStyle(materialStyle);
    },
    [setMaterialStyle],
  );

  const handleSizeSelect = useCallback((size: IconSize) => {
    setConfig((prev) => ({
      ...prev,
      defaultSize: size,
    }));
  }, []);

  const handleStrokeWidthChange = useCallback((value: number) => {
    setConfig((prev) => ({
      ...prev,
      strokeWidth: value,
    }));
  }, []);

  const isLoading = brandId != null && existingFoundation === undefined;
  const selectedSetMetadata = IconSetRegistry[config.selectedSet];
  const supportsStrokeWidth = selectedSetMetadata?.supportsStrokeWidth ?? false;
  const supportsVariant = config.selectedSet === 'tira' || config.selectedSet === 'material';
  const supportsMaterialStyle = config.selectedSet === 'material';
  const sizeOptions = SIZE_OPTIONS.map((option) => ({
    value: option.value,
    label: `${option.label} · ${option.pixels}px`,
  }));
  const iconControls = (
    <div className={iconStyles.toolbarControls}>
      <div className={iconStyles.toolbarControl}>
        <span className={iconStyles.toolbarLabel}>Default size</span>
        <Select
          value={config.defaultSize}
          onChange={handleSizeSelect}
          options={sizeOptions}
          size="sm"
          disabled={isLoading}
          className={iconStyles.sizeSelect}
          aria-label="Default icon size"
        />
      </div>
      {supportsVariant && (
        <div className={iconStyles.toolbarControl}>
          <span className={iconStyles.toolbarLabel}>Default variant</span>
          <Select
            value={config.variant ?? 'outline'}
            onChange={handleVariantSelect}
            options={VARIANT_OPTIONS}
            size="sm"
            disabled={isLoading}
            className={iconStyles.strokeSelect}
            aria-label="Default icon variant"
          />
        </div>
      )}
      {supportsMaterialStyle && (
        <div className={iconStyles.toolbarControl}>
          <span className={iconStyles.toolbarLabel}>Material style</span>
          <Select
            value={config.materialStyle ?? 'outlined'}
            onChange={handleMaterialStyleSelect}
            options={MATERIAL_STYLE_OPTIONS}
            size="sm"
            disabled={isLoading}
            className={iconStyles.strokeSelect}
            aria-label="Material Symbols style"
          />
        </div>
      )}
      {supportsStrokeWidth && (
        <div className={iconStyles.toolbarControl}>
          <span className={iconStyles.toolbarLabel}>Stroke width</span>
          <Select
            value={config.strokeWidth ?? selectedSetMetadata?.defaultStrokeWidth ?? 2}
            onChange={handleStrokeWidthChange}
            options={STROKE_WIDTH_OPTIONS}
            size="sm"
            disabled={isLoading}
            className={iconStyles.strokeSelect}
            aria-label="Icon stroke width"
          />
        </div>
      )}
    </div>
  );

  // Load Jio catalog only when this page is open and Jio is selected.
  useEffect(() => {
    if (config.selectedSet !== 'jio') return;
    void ensureJioIconCatalogLoaded();
  }, [config.selectedSet]);

  useEffect(() => {
    if (!hasInitialized) return;
    setIconVariant(config.variant ?? 'outline');
    setMaterialStyle(config.materialStyle ?? 'outlined');
  }, [
    hasInitialized,
    config.variant,
    config.materialStyle,
    setIconVariant,
    setMaterialStyle,
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Icons Foundation</h1>
        <p className={styles.description}>
          Select and configure the icon set for your brand. The chosen icons will be used across all
          components.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}
              Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={iconStyles.tabsToolbar}>
          <div className={iconStyles.tabsScroller}>
            <Tabs.Root
              value={activeTab}
              onValueChange={(value) => setActiveTab((value as 'browse' | 'details') ?? 'browse')}
            >
              <Tabs.List className={iconStyles.tabsList}>
                <Tabs.Item value="browse" className={iconStyles.firstTab}>
                  Browse &amp; select
                </Tabs.Item>
                <Tabs.Item value="details">Details</Tabs.Item>
                <Tabs.Indicator />
              </Tabs.List>
            </Tabs.Root>
          </div>
        </div>

        <div className={styles.tabPanelStack}>
          {activeTab === 'browse' && (
            <>
              <FoundationCard
                title="Select Icon Set"
                description="Choose the icon library used by your brand. Tira and Material Symbols support a default outline/filled preference within a single set — you do not need two separate libraries."
                headerClassName={iconStyles.selectorHeader}
              >
                <div className={iconStyles.iconSetGrid}>
                  {getIconSetIds().map((setId) => (
                    <IconSetCard
                      key={setId}
                      iconSet={IconSetRegistry[setId]}
                      isSelected={config.selectedSet === setId}
                      onSelect={handleIconSetSelect}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </FoundationCard>
              <FoundationCard
                title="Browse Icons"
                description={`Explore icons from ${selectedSetMetadata?.name ?? 'the selected set'}. Click an icon to copy its import snippet.`}
                actions={iconControls}
                headerClassName={iconStyles.browseHeader}
              >
                <Suspense fallback={<IconBrowserSkeleton />}>
                  <IconBrowser iconSetId={config.selectedSet} maxHeight={450} />
                </Suspense>
              </FoundationCard>
            </>
          )}

          {activeTab === 'details' && (
            <FoundationCard
              title="Icon Set Details"
              description="Reference details for each available icon library."
            >
              <div className={iconStyles.detailsList}>
                <div className={`${iconStyles.detailsRow} ${iconStyles.detailsHeader}`}>
                  <span>Set</span>
                  <span>Style</span>
                  <span>Icons</span>
                  <span>Stroke width</span>
                </div>
                {getIconSetIds().map((setId) => {
                  const metadata = IconSetRegistry[setId];
                  return (
                    <div key={setId} className={iconStyles.detailsRow}>
                      <span className={iconStyles.detailsName}>{metadata.name}</span>
                      <span className={iconStyles.detailsCell}>{toTitleCase(metadata.style)}</span>
                      <span className={iconStyles.detailsCell}>
                        {metadata.totalIcons.toLocaleString()}
                      </span>
                      <span className={iconStyles.detailsCell}>
                        {metadata.supportsStrokeWidth
                          ? `${metadata.defaultStrokeWidth ?? 2}px`
                          : 'Not applicable'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </FoundationCard>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {isSaving && <div className={iconStyles.saveIndicator}>Saving...</div>}
    </div>
  );
}
