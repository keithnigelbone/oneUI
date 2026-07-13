/**
 * agents/design-composition/page.tsx
 *
 * Composition Configuration — mirrors voice overview page exactly.
 * Uses FoundationCard, propertyRow, SliderControl, Switch, Dialog for editing.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Switch } from '@oneui/ui/components/Switch';
import { Select } from '@oneui/ui/components/Select';
import { FoundationCard, SliderControl } from '@/design-tools/Foundations/shared';
import { serializeBrandToDesignMd } from '@oneui/shared/engine';
import { resolveBrandFontName } from '@oneui/shared';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import foundationStyles from '../../foundations/foundation.module.css';
import styles from './composition.module.css';

const VERTICALS = [
  { value: 'general', label: 'General' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'e-commerce', label: 'E-Commerce' },
  { value: 'finance', label: 'Finance' },
  { value: 'governance', label: 'Governance' },
  { value: 'farm', label: 'Farm / Agriculture' },
  { value: 'iot', label: 'IoT' },
  { value: 'telecom', label: 'Telecom' },
] as const;

const CONTEXTS = [
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'web-app', label: 'Web App' },
  { value: 'marketing-page', label: 'Marketing Page' },
  { value: 'social-post', label: 'Social Post' },
  { value: 'print', label: 'Print' },
  { value: 'outdoor', label: 'Outdoor' },
] as const;

const VERTICAL_DESCRIPTIONS: Record<string, string> = {
  general: 'Balanced composition — no vertical-specific overrides applied.',
  entertainment: 'Immersive, image-first layouts. Dark mode preference. Edge-to-edge heroes, horizontal scroll thumbnails, minimal chrome.',
  'e-commerce': 'Product grids with default background. Image-first cards, one CTA per card, sticky cart bar, horizontal chip filters.',
  finance: 'Data-dense with clear hierarchy. Tables, trust signals, conservative spacing, form-heavy flows, numerical typography emphasis.',
  governance: 'Formal, structured. High readability, conservative colour, document-like sections, accessibility-first.',
  farm: 'Simple, clear. Large touch targets, minimal text, icon-heavy navigation, offline-friendly structure.',
  iot: 'Dashboard patterns. Real-time data cards, status indicators, compact density, colour-coded states.',
  telecom: 'Plan comparison cards, usage meters, account management forms, promotional hero sections.',
};

const DENSITY_DESCRIPTIONS: Record<string, string> = {
  spacious: 'Generous whitespace, editorial feel. Best for marketing, content, and brand-forward experiences.',
  balanced: 'Moderate density. Works across most verticals and screen types.',
  compact: 'Data-dense, efficient. Best for dashboards, admin tools, and information-heavy interfaces.',
};

const EXPRESSIVENESS_DESCRIPTIONS: Record<string, string> = {
  minimal: 'Utility-focused, neutral. Content speaks for itself. Best for tools and data-heavy verticals.',
  balanced: 'Strategic accent moments. Bold surfaces used sparingly for heroes and CTAs.',
  bold: 'Hero-driven, immersive. Bold surfaces, display typography, brand-forward expression.',
};

export default function CompositionOverviewPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const compositionConfig = useQuery(
    api.compositionConfigs.get,
    brandId ? { brandId } : 'skip'
  );

  const createDefaults = useMutation(api.compositionConfigs.createDefaults);
  const updateConfig = useMutation(api.compositionConfigs.update);
  const updateLayoutPersonality = useMutation(api.compositionConfigs.updateLayoutPersonality);

  // ── DESIGN.md export wiring ──────────────────────────────────────────
  const systemBrand = useQuery(api.brands.getBySlug, { slug: 'oneui-system' });
  const systemBrandId = systemBrand?._id;
  const resolvedRules = useQuery(
    api.compositionRules.getResolved,
    brandId && systemBrandId ? { brandId, systemBrandId } : 'skip',
  );
  const brandSkills = useQuery(
    api.compositionSkills.list,
    brandId ? { brandId } : 'skip',
  );
  const foundationData = useFoundationData();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncToRepo = useCallback(async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/skills/sync', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json?.queued) {
        setSyncStatus('Queued — workflow run started.');
      } else {
        setSyncStatus(`Failed: ${json?.error ?? `status ${res.status}`}`);
      }
    } catch (err) {
      setSyncStatus(`Failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleExportDesignMd = useCallback(() => {
    if (!currentBrand || !brandId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fd = foundationData as any;
    const fontSelection = fd?.typography?.fontSelection ?? fd?.typography?.config?.fontSelection;
    const customFonts = fd?.customFonts ?? [];
    const primaryFontName = resolveBrandFontName(fontSelection?.primaryFontId, customFonts);
    const codeFontName = resolveBrandFontName(fontSelection?.codeFontId, customFonts);
    const markdown = serializeBrandToDesignMd({
      brand: {
        name: currentBrand.name,
        slug: currentBrand.slug ?? currentBrand.name.toLowerCase().replace(/\s+/g, '-'),
        description: currentBrand.description ?? undefined,
        primaryHue: currentBrand.primaryHue,
        primaryChroma: currentBrand.primaryChroma,
        secondaryHue: currentBrand.secondaryHue,
        secondaryChroma: currentBrand.secondaryChroma,
      },
      colorConfig: fd?.color?.config ?? null,
      presetSelection: fd?.presetSelection ?? null,
      rules: Array.isArray(resolvedRules) ? resolvedRules : [],
      skills: Array.isArray(brandSkills)
        ? brandSkills.filter((s: any) => s.isActive !== false)
        : [],
      defaultContext: compositionConfig?.defaultContext,
      vertical: compositionConfig?.vertical,
      layoutPersonality: compositionConfig?.layoutPersonality,
      fontFamilyPrimary: primaryFontName,
      fontFamilyCode: codeFontName,
    });
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBrand.slug ?? 'brand'}.DESIGN.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentBrand, brandId, foundationData, resolvedRules, brandSkills, compositionConfig]);

  const handleCreateDefaults = useCallback(async () => {
    if (!brandId) return;
    await createDefaults({ brandId });
  }, [brandId, createDefaults]);

  const handleVerticalChange = useCallback(
    async (value: string) => {
      if (!compositionConfig) return;
      await updateConfig({ id: compositionConfig._id, vertical: value as any });
    },
    [compositionConfig, updateConfig],
  );

  const handleContextChange = useCallback(
    async (value: string) => {
      if (!compositionConfig) return;
      await updateConfig({ id: compositionConfig._id, defaultContext: value as any });
    },
    [compositionConfig, updateConfig],
  );

  const handleDensityChange = useCallback(
    async (value: number) => {
      if (!compositionConfig) return;
      await updateLayoutPersonality({
        id: compositionConfig._id,
        layoutPersonality: {
          density: value,
          expressiveness: compositionConfig.layoutPersonality.expressiveness,
        },
      });
    },
    [compositionConfig, updateLayoutPersonality],
  );

  const handleExpressivenessChange = useCallback(
    async (value: number) => {
      if (!compositionConfig) return;
      await updateLayoutPersonality({
        id: compositionConfig._id,
        layoutPersonality: {
          density: compositionConfig.layoutPersonality.density,
          expressiveness: value,
        },
      });
    },
    [compositionConfig, updateLayoutPersonality],
  );

  const handleTogglePref = useCallback(
    async (key: 'preferBoldHeros' | 'preferMinimalContainers', checked: boolean) => {
      if (!compositionConfig) return;
      await updateConfig({ id: compositionConfig._id, [key]: checked });
    },
    [compositionConfig, updateConfig],
  );

  // Derived descriptions
  const densityLabel = useMemo(() => {
    if (!compositionConfig) return '';
    const d = compositionConfig.layoutPersonality.density;
    if (d < 35) return 'spacious';
    if (d < 65) return 'balanced';
    return 'compact';
  }, [compositionConfig]);

  const expressivenessLabel = useMemo(() => {
    if (!compositionConfig) return '';
    const e = compositionConfig.layoutPersonality.expressiveness;
    if (e < 35) return 'minimal';
    if (e < 65) return 'balanced';
    return 'bold';
  }, [compositionConfig]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to configure composition.</p>
      </div>
    );
  }

  if (compositionConfig === undefined) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Configuration</h1>
          <p className={foundationStyles.description}>Loading composition configuration...</p>
        </div>
      </div>
    );
  }

  if (compositionConfig === null) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Configuration</h1>
          <p className={foundationStyles.description}>
            Define how your brand composes UI — surface usage, attention hierarchy, typography,
            spacing, and component selection rules.
            {currentBrand && (
              <span className={foundationStyles.brandIndicator}>
                {' '}Configuring for <strong>{currentBrand.name}</strong>
              </span>
            )}
          </p>
        </div>
        <FoundationCard
          title="Get started"
          description="No composition configuration exists for this brand yet. Create one with recommended defaults."
        >
          <Button attention="high" onClick={handleCreateDefaults}>
            Create composition configuration
          </Button>
        </FoundationCard>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Configuration</h1>
        <p className={foundationStyles.description}>
          Define how your brand composes UI — surface usage, attention hierarchy, typography,
          spacing, and component selection rules.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={foundationStyles.content}>
        {/* Vertical adaptation */}
        <FoundationCard
          title="Vertical adaptation"
          description="Defines how composition adapts to this brand's industry. Vertical-specific rules adjust layout density, surface usage, component selection, and content patterns."
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Industry vertical</span>
              <Select
                value={compositionConfig.vertical}
                onChange={handleVerticalChange}
                options={VERTICALS.map((v) => ({ value: v.value, label: v.label }))}
                size="sm"
              />
            </div>
          </div>
          <p className={styles.verticalDescription}>
            {VERTICAL_DESCRIPTIONS[compositionConfig.vertical] ?? VERTICAL_DESCRIPTIONS.general}
          </p>
        </FoundationCard>

        {/* Layout personality */}
        <FoundationCard
          title="Layout personality"
          description="Two dials that independently control how spacious and how visually expressive compositions feel. These influence spacing tokens, surface mode frequency, and typography scale selection."
        >
          <div className={styles.sliderGrid}>
            <SliderControl
              label="Density"
              value={compositionConfig.layoutPersonality.density}
              min={0}
              max={100}
              step={1}
              description={DENSITY_DESCRIPTIONS[densityLabel]}
              onChange={handleDensityChange}
              showValue
            />
            <SliderControl
              label="Expressiveness"
              value={compositionConfig.layoutPersonality.expressiveness}
              min={0}
              max={100}
              step={1}
              description={EXPRESSIVENESS_DESCRIPTIONS[expressivenessLabel]}
              onChange={handleExpressivenessChange}
              showValue
            />
          </div>
        </FoundationCard>

        {/* Default output context */}
        <FoundationCard
          title="Default output context"
          description="The target platform when no context is specified. Each context applies different layout constraints, spacing, touch targets, and typography rules."
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Context</span>
              <Select
                value={compositionConfig.defaultContext}
                onChange={handleContextChange}
                options={CONTEXTS.map((c) => ({ value: c.value, label: c.label }))}
                size="sm"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Composition preferences */}
        <FoundationCard
          title="Composition preferences"
          description="Global preferences that influence how the agent applies surfaces, containers, and visual hierarchy."
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Prefer bold hero sections</span>
              <Switch
                checked={compositionConfig.preferBoldHeros ?? false}
                onCheckedChange={(checked) => handleTogglePref('preferBoldHeros', checked)}
                size="m"
              />
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Prefer minimal containers</span>
              <Switch
                checked={compositionConfig.preferMinimalContainers ?? true}
                onCheckedChange={(checked) => handleTogglePref('preferMinimalContainers', checked)}
                size="m"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Export for external agents */}
        <FoundationCard
          title="Export for external agents"
          description="Emit a DESIGN.md file (Google Labs spec, github.com/google-labs-code/design.md) with this brand's tokens and composition rules. Drop it into a Cursor, Claude Code, or Copilot session so external agents can follow your design system."
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Format</span>
              <span className={styles.propertyValue}>DESIGN.md (alpha spec)</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>File</span>
              <span className={styles.propertyValue}>
                {(currentBrand?.slug ?? 'brand')}.DESIGN.md
              </span>
            </div>
          </div>
          <Button
            attention="high"
            onClick={handleExportDesignMd}
            disabled={resolvedRules === undefined}
          >
            Export DESIGN.md
          </Button>
        </FoundationCard>

        {/* Sync to repository */}
        <FoundationCard
          title="Sync to repository"
          description="Push the latest DESIGN.md snapshots for every active brand to the main branch via the sync-designmd GitHub Action. The action also runs automatically every 6 hours."
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Workflow</span>
              <span className={styles.propertyValue}>sync-designmd.yml</span>
            </div>
            {syncStatus && (
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Status</span>
                <span className={styles.propertyValue}>{syncStatus}</span>
              </div>
            )}
          </div>
          <Button
            attention="medium"
            appearance="neutral"
            onClick={handleSyncToRepo}
            disabled={syncing}
          >
            {syncing ? 'Queuing…' : 'Sync to GitHub now'}
          </Button>
        </FoundationCard>

        {/* Status */}
        <FoundationCard title="Status">
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Version</span>
              <span className={styles.propertyValue}>{compositionConfig.version}</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Active</span>
              <Badge
                attention="medium"
                appearance={compositionConfig.isActive ? 'positive' : 'neutral'}
                size="m"
              >
                {compositionConfig.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </FoundationCard>
      </div>
    </div>
  );
}
