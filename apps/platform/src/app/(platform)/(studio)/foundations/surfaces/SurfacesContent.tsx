/**
 * foundations/surfaces/SurfacesContent.tsx
 *
 * Surfaces Foundation page — clean, minimal UI.
 * Chips for instant role and theme switching.
 * No algorithm changes — purely presentation.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import { Tabs } from '@oneui/ui/components/Tabs';
import { Select } from '@oneui/ui/components/Select';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Chip } from '@oneui/ui/components/Chip';
import {
  FoundationCard,
} from '@/design-tools/Foundations/shared';
import {
  SurfaceNewPreview,
  SurfaceValidationTable,
} from '@/design-tools/Foundations/Surfaces';
import {
  buildAvailableScales,
  buildScaleDefinition,
  buildPaletteFromScale,
  effectiveBrandBgBaseStep,
  isAppearanceRoleAnchoringBold,
  resolveTokenSet,
  type ScaleDefinition,
  type ResolvedTokenSet,
} from '@oneui/shared/engine';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import styles from '../foundation.module.css';
import { ExportTokensButton } from '@/components/foundation/ExportTokensButton';

// ============================================================================
// Types
// ============================================================================

interface RoleData {
  role: string;
  scaleName: string;
  scaleDefinition: ScaleDefinition;
  tokenSet: ResolvedTokenSet;
}

// ============================================================================
// Main Component
// ============================================================================

export default function SurfacesContent() {
  const { handleNavigate } = usePlatformNavigation();
  const { currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [previewDarkMode, setPreviewDarkMode] = useState(false);
  const [activeSurfaceTab, setActiveSurfaceTab] = useState<'editor' | 'validation'>('editor');

  const outerParentStep = previewDarkMode ? 200 : 2500;

  // Build available scales from foundation data
  const colorConfig = foundationData?.color?.config;
  const presetSelection = foundationData?.presetSelection;
  const appearanceConfig = foundationData?.appearanceConfig as {
    accents?: Array<{ role: string; scaleName: string; baseStep: number }>;
    background?: { backgroundStep?: { light?: number } };
  } | null | undefined;

  const availableScales = useMemo(
    () => buildAvailableScales(colorConfig, presetSelection),
    [colorConfig, presetSelection],
  );

  // Build per-role data
  const roleDataMap = useMemo(() => {
    const map = new Map<string, RoleData>();
    if (!appearanceConfig?.accents?.length || !availableScales.length) return map;

    for (const accent of appearanceConfig.accents) {
      const scale = availableScales.find(
        s => s.name.toLowerCase() === accent.scaleName.toLowerCase(),
      );
      if (!scale?.colors) continue;

      const palette = buildPaletteFromScale(scale);
      const effectiveBaseStep =
        accent.role === 'brand-bg'
          ? effectiveBrandBgBaseStep(
              accent.baseStep,
              appearanceConfig?.background?.backgroundStep?.light,
              scale.baseStep,
            )
          : (accent.baseStep ?? scale.baseStep);
      // Same overload split as computeNewStacking.ts / precompute.ts —
      // buildScaleDefinition doesn't accept `options | undefined`.
      const scaleDef = isAppearanceRoleAnchoringBold(accent.role)
        ? buildScaleDefinition(accent.scaleName, palette, effectiveBaseStep, { anchorBoldToBaseStep: true })
        : buildScaleDefinition(accent.scaleName, palette, effectiveBaseStep);
      const tokenSet = resolveTokenSet(scaleDef, outerParentStep, previewDarkMode);

      map.set(accent.role, {
        role: accent.role,
        scaleName: accent.scaleName,
        scaleDefinition: scaleDef,
        tokenSet,
      });
    }

    // Auto-inject neutral
    if (!map.has('neutral')) {
      const neutralScale = availableScales.find(s => s.name.toLowerCase() === 'neutral');
      if (neutralScale?.colors) {
        const palette = buildPaletteFromScale(neutralScale);
        const scaleDef = buildScaleDefinition('Neutral', palette, neutralScale.baseStep ?? 1300);
        const tokenSet = resolveTokenSet(scaleDef, outerParentStep, previewDarkMode);
        map.set('neutral', { role: 'neutral', scaleName: 'Neutral', scaleDefinition: scaleDef, tokenSet });
      }
    }

    return map;
  }, [availableScales, appearanceConfig, outerParentStep, previewDarkMode]);

  const configuredRoles = useMemo(() => Array.from(roleDataMap.keys()), [roleDataMap]);

  // Auto-select first role
  useEffect(() => {
    if (configuredRoles.length > 0 && !configuredRoles.includes(selectedRole)) {
      setSelectedRole(configuredRoles.includes('primary') ? 'primary' : configuredRoles[0]);
    }
  }, [configuredRoles, selectedRole]);

  const currentRole = roleDataMap.get(selectedRole);

  const isLoading = foundationData === undefined;
  const hasNoScales = availableScales.length === 0 && !isLoading;
  const roleOptions = useMemo(
    () => configuredRoles.map(role => ({
      value: role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
    })),
    [configuredRoles],
  );

  const surfaceEditorControls = (
    <div className={styles.foundationInlineControls}>
      <div className={styles.foundationControlStack}>
        <span className={styles.foundationControlLabel}>Role</span>
        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          options={roleOptions}
          size="sm"
          className={styles.foundationControlSelect}
          aria-label="Surface role"
        />
      </div>

      <div className={`${styles.foundationControlGroup} ${styles.foundationTrailingControl}`}>
        <span className={styles.foundationControlLabel}>Theme</span>
        <ChipGroup
          value={[previewDarkMode ? 'dark' : 'light']}
          onValueChange={(values) => {
            const next = values[0];
            if (next) setPreviewDarkMode(next === 'dark');
          }}
          required
          size="s"
        >
          <Chip value="light">Light</Chip>
          <Chip value="dark">Dark</Chip>
        </ChipGroup>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Surfaces</h1>
        <p className={styles.description}>
          Surface tokens define fill levels, content colors, and interaction states for each appearance role.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        {isLoading && <PageSkeleton cards={2} />}

        {/* No scales */}
        {hasNoScales && (
          <FoundationCard
            title="Foundation Setup Required"
            description="Surfaces depend on color scales and appearance configuration."
          >
            <div style={{
              padding: 'var(--Spacing-4-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-4)',
            }}>
              <p style={{ color: 'var(--Text-Medium)', margin: 0, lineHeight: 1.6 }}>
                Complete these steps in order:
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)',
                padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                backgroundColor: 'var(--Surface-Minimal)', borderRadius: 'var(--Shape-4)',
                border: '1px solid var(--Border-Default)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: 'var(--Shape-Pill)',
                  backgroundColor: 'var(--Surface-Bold)', color: 'var(--Text-OnBold-High)',
                  fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', flexShrink: 0,
                }}>1</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--Text-High)' }}>Color Scales</strong>
                  <span style={{ color: 'var(--Text-Medium)', marginLeft: 'var(--Spacing-3)' }}>
                    — Define at least one color scale
                  </span>
                </div>
                <Button attention="high" size="small" onPress={() => handleNavigate('/foundations/color')}>
                  Configure
                </Button>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)',
                padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                backgroundColor: 'var(--Surface-Minimal)', borderRadius: 'var(--Shape-4)',
                border: '1px solid var(--Border-Subtle)', opacity: 0.6,
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: 'var(--Shape-Pill)',
                  backgroundColor: 'var(--Surface-Subtle)', color: 'var(--Text-Medium)',
                  fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', flexShrink: 0,
                }}>2</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--Text-Medium)' }}>Appearance</strong>
                  <span style={{ color: 'var(--Text-Low)', marginLeft: 'var(--Spacing-3)' }}>
                    — Assign accent roles (requires color scales)
                  </span>
                </div>
              </div>
            </div>
          </FoundationCard>
        )}

        {/* Main content */}
        {!isLoading && !hasNoScales && configuredRoles.length > 0 && (
          <>
            <div className={styles.foundationTabsRow}>
              <Tabs.Root
                value={activeSurfaceTab}
                onValueChange={(value) => setActiveSurfaceTab((value as 'editor' | 'validation') ?? 'editor')}
              >
                <Tabs.List className={styles.foundationTabsList}>
                  <Tabs.Item value="editor">Editor</Tabs.Item>
                  <Tabs.Item value="validation">Validation</Tabs.Item>
                  <Tabs.Indicator />
                </Tabs.List>
              </Tabs.Root>
            </div>

            <div className={styles.tabPanelStack}>
              {activeSurfaceTab === 'editor' && (
                <>
                  {/* Surface Preview */}
                  {currentRole && (
                    <FoundationCard
                      title={`${currentRole.role.charAt(0).toUpperCase() + currentRole.role.slice(1)} — ${currentRole.scaleName}`}
                      description="Surface fills, content tokens, interaction states, and context awareness."
                      collapsible
                      defaultCollapsed={false}
                    >
                      {surfaceEditorControls}
                      <SurfaceNewPreview
                        roleName={currentRole.role}
                        scaleName={currentRole.scaleName}
                        tokenSet={currentRole.tokenSet}
                        scaleDefinition={currentRole.scaleDefinition}
                        darkMode={previewDarkMode}
                      />
                    </FoundationCard>
                  )}

                  {/* Transparent Material — surfaces over arbitrary media */}
                  <FoundationCard
                    title="Transparent Material"
                    description="Surfaces composited over arbitrary media (photos, video, hero backgrounds). Pick a mediaContext based on what the underlying media looks like — dynamic for unpredictable imagery, dark/light when known. Buttons inside each Surface pick up rgba-composited content tokens automatically."
                    collapsible
                    defaultCollapsed
                  >
                    <TransparentMaterialPreview />
                  </FoundationCard>
                </>
              )}

              {activeSurfaceTab === 'validation' && (
                <ValidationTabPanel
                  roleDataMap={roleDataMap}
                  darkMode={previewDarkMode}
                  onDarkModeChange={setPreviewDarkMode}
                />
              )}
            </div>
          </>
        )}

        {/* No roles */}
        {!isLoading && !hasNoScales && configuredRoles.length === 0 && (
          <FoundationCard
            title="No Appearance Roles"
            description="Configure appearance roles to see surface previews."
          >
            <div style={{ padding: 'var(--Spacing-4-5)' }}>
              <Button attention="high" size="small" onPress={() => handleNavigate('/foundations/appearance')}>
                Configure Appearance
              </Button>
            </div>
          </FoundationCard>
        )}
      </div>

      <div className={styles.foundationFooterActions}>
        <ExportTokensButton foundation="surface" />
      </div>
    </div>
  );
}

// ============================================================================
// ValidationTabPanel
//
// Wraps SurfaceValidationTable — ports the reference ColourTool's 25-step ×
// role grid into our foundations UI. Starts on primary (per design decision).
// Reuses the Editor tab's darkMode toggle rather than introducing a second one.
// ============================================================================

interface ValidationTabPanelProps {
  roleDataMap: Map<string, RoleData>;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
}

function ValidationTabPanel({ roleDataMap, darkMode, onDarkModeChange }: ValidationTabPanelProps) {
  const scales = useMemo(
    () =>
      Array.from(roleDataMap.values()).map(role => ({
        name: role.role,
        scale: role.scaleDefinition,
      })),
    [roleDataMap],
  );

  const informativeScale =
    roleDataMap.get('informative')?.scaleDefinition
    ?? roleDataMap.get('primary')?.scaleDefinition
    ?? roleDataMap.get('neutral')?.scaleDefinition;

  if (!informativeScale || scales.length === 0) {
    return (
      <FoundationCard title="Surface Validation Table" description="No scales available for validation.">
        <div style={{ color: 'var(--Text-Medium)' }}>No scales available for validation.</div>
      </FoundationCard>
    );
  }

  const validationActions = (
    <div className={styles.foundationControls}>
      <div className={styles.foundationControlGroup}>
        <span className={styles.foundationControlLabel}>Theme</span>
        <ChipGroup
          value={[darkMode ? 'dark' : 'light']}
          onValueChange={(values) => {
            const next = values[0];
            if (next) onDarkModeChange(next === 'dark');
          }}
          required
          size="s"
        >
          <Chip value="light">Light</Chip>
          <Chip value="dark">Dark</Chip>
        </ChipGroup>
      </div>
    </div>
  );

  return (
    <FoundationCard
      title="Surface Validation Table"
      description="25 scale steps × surface / content / interaction / focus tokens. Cross-check our engine output against the canonical reference (OneUIColourTool)."
      actions={validationActions}
      collapsible
      defaultCollapsed={false}
    >
      <SurfaceValidationTable
        scales={scales}
        informativeScale={informativeScale}
        darkMode={darkMode}
        initialScaleName="primary"
      />
    </FoundationCard>
  );
}

// ============================================================================
// TransparentMaterialPreview
//
// 3 rows (one per media context) × 8 surface modes. Each row sits over a
// gradient stand-in for a media background so designers can see how the
// transparent surfaces composite against different underlying luminance.
// Reads from the live brand CSS (`[data-material="transparent"]` blocks
// injected by useBrandCSS), not inline computed values — this proves the
// wiring end-to-end.
// ============================================================================

const MEDIA_CONTEXTS = [
  {
    ctx: 'dynamic' as const,
    label: 'Dynamic',
    description: 'Unknown media (arbitrary photo). Fills lean more opaque for worst-case legibility.',
    // Stand-in: high-contrast multi-hue gradient — mimics a "hard" photo.
    background: 'linear-gradient(135deg, var(--Primary-Bold) 0%, var(--Negative-Bold, var(--Primary-Bold)) 50%, var(--Warning-Bold, var(--Primary-Bold)) 100%)',
  },
  {
    ctx: 'dark' as const,
    label: 'Dark',
    description: 'Known dark media. Lighter overlays so content pops.',
    background: 'linear-gradient(135deg, var(--Neutral-Bold) 0%, var(--Primary-Bold) 100%)',
  },
  {
    ctx: 'light' as const,
    label: 'Light',
    description: 'Known light media. Darker overlays so content pops.',
    background: 'linear-gradient(135deg, var(--Surface-Default) 0%, var(--Neutral-Minimal) 100%)',
  },
];

const TRANSPARENT_MODES = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'] as const;

function TransparentMaterialPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)', padding: 'var(--Spacing-4-5)' }}>
      {MEDIA_CONTEXTS.map(({ ctx, label, description, background }) => (
        <div key={ctx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
          <div>
            <strong style={{ color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
              mediaContext="{ctx}" — {label}
            </strong>
            <p style={{ color: 'var(--Text-Medium)', margin: 'var(--Spacing-2-5) 0 0', fontSize: 'var(--Body-S-FontSize)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
              {description}
            </p>
          </div>
          <div
            style={{
              background,
              borderRadius: 'var(--Shape-4-5)',
              padding: 'var(--Spacing-4-5)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--Spacing-4)',
            }}
          >
            {TRANSPARENT_MODES.map((mode) => (
              <Surface
                key={mode}
                mode={mode}
                material="transparent"
                mediaContext={ctx}
                style={{
                  padding: 'var(--Spacing-4-5)',
                  borderRadius: 'var(--Shape-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-3-5)',
                  minHeight: 120,
                }}
              >
                <code style={{ fontFamily: 'var(--Typography-Font-Code)', fontSize: 'var(--Label-XS-FontSize)' }}>
                  mode="{mode}"
                </code>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <Button attention="high" size="small">Bold</Button>
                  <Button attention="medium" size="small">Subtle</Button>
                  <Button attention="low" size="small">Ghost</Button>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
