/**
 * manager.tsx
 *
 * Storybook manager addon — unified Brand → Platform → Density toolbar.
 * Brand selection drives everything: available platforms and densities
 * cascade from the brand's foundation config stored in Convex.
 *
 * Uses Convex HTTP API (fetch) since the manager runs outside the
 * preview's React tree / ConvexProvider.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { addons, types, useGlobals } from 'storybook/manager-api';

const ADDON_ID = 'oneui-brand';
const TOOL_ID = `${ADDON_ID}/tool`;

// Injected via main.ts managerHead — most reliable for the manager build.
declare const __CONVEX_URL__: string | undefined;
const CONVEX_URL =
  (typeof __CONVEX_URL__ !== 'undefined' ? __CONVEX_URL__ : '') ||
  (typeof process !== 'undefined' ? (process.env as Record<string, string>).CONVEX_URL ?? '' : '');
const JIO_ALPHA_BRAND_SLUG = 'jio';

// ============================================================================
// Types
// ============================================================================

interface Brand {
  _id: string;
  name: string;
  slug: string;
  status?: string;
}

interface Theme {
  _id: string;
  parentBrandId: string;
  name: string;
  slug: string;
}

interface PlatformBreakpoint {
  id: string;
  label: string;
  viewportWidth: number;
  isActive: boolean;
}

interface PlatformDensityConfig {
  density: string;
  mobile: { baseSize: number; scaleFactor: number };
  desktop: { baseSize: number; scaleFactor: number };
}

interface PlatformEntry {
  id: string;
  label: string;
  isEnabled: boolean;
  breakpoints: PlatformBreakpoint[];
  viewportMin: number;
  viewportMax: number;
  densityConfigs: PlatformDensityConfig[];
}

interface PlatformsConfig {
  platforms: PlatformEntry[];
  defaultPlatform: string;
  defaultDensity: string;
}

// ============================================================================
// Default fallback config (used when brand has no platforms foundation)
// Matches PLATFORM_CONFIG_PRESETS from @oneui/shared
// ============================================================================

const DEFAULT_PLATFORMS_CONFIG: PlatformsConfig = {
  platforms: [
    {
      id: 'web',
      label: 'Web',
      isEnabled: true,
      breakpoints: [
        { id: 'mobile-360', label: 'Mobile', viewportWidth: 360, isActive: true },
        { id: 'tablet-768', label: 'Tablet', viewportWidth: 768, isActive: true },
        { id: 'tablet-landscape-1024', label: 'Tablet Landscape', viewportWidth: 1024, isActive: true },
        { id: 'desktop-1440', label: 'Desktop', viewportWidth: 1440, isActive: true },
        { id: 'desktop-1920', label: 'Desktop Large', viewportWidth: 1920, isActive: true },
      ],
      viewportMin: 360,
      viewportMax: 1920,
      densityConfigs: [
        { density: 'compact', mobile: { baseSize: 14, scaleFactor: 1.1 }, desktop: { baseSize: 18, scaleFactor: 1.3 } },
        { density: 'default', mobile: { baseSize: 16, scaleFactor: 1.125 }, desktop: { baseSize: 20, scaleFactor: 1.185 } },
        { density: 'open', mobile: { baseSize: 17, scaleFactor: 1.15 }, desktop: { baseSize: 22, scaleFactor: 1.195 } },
      ],
    },
  ],
  defaultPlatform: 'web',
  defaultDensity: 'default',
};

// ============================================================================
// Convex HTTP helper
// ============================================================================

async function convexQuery<T>(path: string, args: Record<string, unknown>): Promise<T | null> {
  if (!CONVEX_URL) return null;
  try {
    const res = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, args, format: 'json' }),
    });
    const data = await res.json();
    if (data.status === 'success') return data.value as T;
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Toolbar Component
// ============================================================================

function BrandToolbar() {
  const [globals, updateGlobals] = useGlobals();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [brandPlatformsConfig, setBrandPlatformsConfig] = useState<PlatformsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch brands on mount and auto-select the Jio alpha brand if none is selected.
  // Without a brand, role-specific tokens (--Primary-Bold, --Secondary-Bold, etc.)
  // are undefined and all components fall back to generic Surface tokens (black/grey).
  const brandId = globals.brand as string | undefined;
  const themeVariantId = globals.theme as string | undefined;
  const hasAutoSelected = React.useRef(false);

  useEffect(() => {
    convexQuery<Brand[]>('brands:list', {}).then(result => {
      if (result) {
        setBrands(result);
        // Auto-select Jio once when no brand is persisted.
        // Uses ref to avoid overriding user selection if fetch resolves late.
        if (!hasAutoSelected.current && !brandId && result.length > 0) {
          hasAutoSelected.current = true;
          const jioAlphaBrand =
            result.find((brand) => brand.slug === JIO_ALPHA_BRAND_SLUG) ?? result[0];
          updateGlobals({ brand: jioAlphaBrand._id });
        }
      }
      setLoading(false);
    });
  }, [brandId, updateGlobals]);

  // Fetch platforms config when brand changes
  useEffect(() => {
    if (!brandId) {
      setBrandPlatformsConfig(null);
      return;
    }

    convexQuery<Record<string, any>>('foundations:getBrandOverviewData', { brandId })
      .then(result => {
        if (result?.platforms?.config) {
          setBrandPlatformsConfig(result.platforms.config as PlatformsConfig);
        } else {
          setBrandPlatformsConfig(null);
        }
      });
  }, [brandId]);

  // Fetch sub-brands ("sub-themes") for the selected parent brand. Sub-brands
  // override 4 accent roles (primary/secondary/sparkle/brand-bg) while inheriting
  // every other foundation from the parent. The preview decorator merges the
  // selected sub-brand's accents into the parent foundation before brand CSS gen.
  useEffect(() => {
    if (!brandId) {
      setThemes([]);
      return;
    }

    let cancelled = false;
    convexQuery<Theme[]>('subBrandConfigs:getByParentBrand', { parentBrandId: brandId })
      .then(result => {
        if (cancelled) return;
        const list = result ?? [];
        setThemes(list);
        // Clear a stale theme selection if it doesn't belong to this parent.
        if (themeVariantId && !list.some((s) => s._id === themeVariantId)) {
          updateGlobals({ theme: '' });
        }
      });
    return () => {
      cancelled = true;
    };
    // themeVariantId intentionally omitted: we only re-fetch on parent brand change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, updateGlobals]);

  // Use brand config if available, otherwise fall back to defaults
  const platformsConfig = brandPlatformsConfig ?? DEFAULT_PLATFORMS_CONFIG;

  // Derive available platforms (only enabled ones)
  const enabledPlatforms = useMemo(() => {
    return platformsConfig.platforms.filter((p: PlatformEntry) => p.isEnabled);
  }, [platformsConfig]);

  // Derive available breakpoints from selected platform
  const selectedPlatformId = (globals.platform as string) || platformsConfig.defaultPlatform || '';
  const selectedPlatform = enabledPlatforms.find((p: PlatformEntry) => p.id === selectedPlatformId)
    || enabledPlatforms[0];

  const activeBreakpoints = useMemo(() => {
    if (!selectedPlatform?.breakpoints) return [];
    return selectedPlatform.breakpoints.filter((bp: PlatformBreakpoint) => bp.isActive);
  }, [selectedPlatform]);

  // Available densities from selected platform
  const availableDensities = useMemo(() => {
    if (!selectedPlatform?.densityConfigs?.length) return ['compact', 'default', 'open'];
    return selectedPlatform.densityConfigs.map((dc: PlatformDensityConfig) => dc.density);
  }, [selectedPlatform]);

  // When brand or selected platform changes, reset platform/breakpoint/density
  // to brand defaults so dimensions actually match the platform foundation.
  //
  // Bug that prompted this: previously only `platform` and `density` were
  // reset. `breakpoint` stayed at `'responsive'`, which in preview.ts fell
  // through to `S` — so regardless of which brand or platform the user
  // picked, the first paint was locked to mobile 360px. Resetting breakpoint
  // to the selected platform's default viewport width ensures the V2 platform
  // cascade (scale.css + brand dimension CSS) reflects the intended platform.
  useEffect(() => {
    const updates: Record<string, string> = {};

    // Set platform to brand default if current selection isn't available
    const currentPlatform = globals.platform as string;
    const platformIds = enabledPlatforms.map((p: PlatformEntry) => p.id);
    if (!currentPlatform || !platformIds.includes(currentPlatform)) {
      updates.platform = platformsConfig.defaultPlatform || platformIds[0] || 'web';
    }

    // Set density to brand default if current selection isn't available
    const currentDensity = globals.density as string;
    if (!currentDensity || !availableDensities.includes(currentDensity)) {
      updates.density = platformsConfig.defaultDensity || 'default';
    }

    // Reset breakpoint to the selected platform's first active breakpoint if
    // the current breakpoint is missing or no longer valid for this platform.
    const currentBreakpoint = globals.breakpoint as string;
    const activeBpValues = activeBreakpoints.map((bp: PlatformBreakpoint) => String(bp.viewportWidth));
    const breakpointValid = currentBreakpoint === 'responsive' || activeBpValues.includes(currentBreakpoint);
    if (!currentBreakpoint || !breakpointValid) {
      updates.breakpoint = activeBpValues[0] ?? 'responsive';
    }

    if (Object.keys(updates).length > 0) {
      updateGlobals(updates);
    }
  }, [platformsConfig, enabledPlatforms, availableDensities, activeBreakpoints]);

  // Handlers
  const onBrandChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Reset sub-brand: a sub-brand belongs to exactly one parent.
      updateGlobals({ brand: e.target.value || '', theme: '' });
    },
    [updateGlobals]
  );

  const onThemeVariantChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateGlobals({ theme: e.target.value || '' });
    },
    [updateGlobals]
  );

  const onPlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateGlobals({ platform: e.target.value });
    },
    [updateGlobals]
  );

  const onBreakpointChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateGlobals({ breakpoint: e.target.value });
    },
    [updateGlobals]
  );

  const onDensityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateGlobals({ density: e.target.value });
    },
    [updateGlobals]
  );

  if (loading) {
    return (
      <div style={toolbarStyle}>
        <span style={labelDimStyle}>Loading…</span>
      </div>
    );
  }

  if (brands.length === 0) return null;

  const densityLabels: Record<string, string> = {
    compact: 'Compact',
    default: 'Default',
    open: 'Open',
  };

  return (
    <div style={toolbarStyle}>
      {/* ── Brand (dominant control) ── */}
      <div style={groupStyle}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: brandId ? '#e53935' : '#bbb',
            flexShrink: 0,
          }}
        />
        <select
          value={brandId || ''}
          onChange={onBrandChange}
          title="Select brand"
          style={selectStyle}
        >
          <option value="">No Brand</option>
          {brands.map((b: Brand) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* ── Sub-theme (driven by brand) ── */}
      {brandId && themes.length > 0 && (
        <>
          <div style={dividerStyle} />
          <div style={groupStyle}>
            <select
              value={themeVariantId || ''}
              onChange={onThemeVariantChange}
              title="Select theme variant"
              style={selectStyle}
            >
              <option value="">Base brand</option>
              {themes.map((s: Theme) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* ── Platform (driven by brand) ── */}
      {enabledPlatforms.length > 0 && (
        <>
          <div style={dividerStyle} />
          <div style={groupStyle}>
            <select
              value={selectedPlatform?.id || ''}
              onChange={onPlatformChange}
              title="Select platform"
              style={selectStyle}
            >
              {enabledPlatforms.map((p: PlatformEntry) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* ── Viewport breakpoint (driven by platform) ── */}
      {activeBreakpoints.length > 0 && (
        <>
          <div style={dividerStyle} />
          <div style={groupStyle}>
            <select
              value={(globals.breakpoint as string) || 'responsive'}
              onChange={onBreakpointChange}
              title="Select viewport breakpoint"
              style={selectStyle}
            >
              <option value="responsive">Responsive</option>
              {activeBreakpoints.map((bp: PlatformBreakpoint) => (
                <option key={bp.id} value={String(bp.viewportWidth)}>
                  {bp.label} ({bp.viewportWidth}px)
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* ── Density (driven by brand/platform) ── */}
      <div style={dividerStyle} />
      <div style={groupStyle}>
        <select
          value={(globals.density as string) || 'default'}
          onChange={onDensityChange}
          title="Select density"
          style={selectStyle}
        >
          {availableDensities.map((d: string) => (
            <option key={d} value={d}>{densityLabels[d] || d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// Styles (minimal, matches Storybook toolbar feel)
// ============================================================================

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: '100%',
  padding: '0 4px',
};

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 16,
  backgroundColor: 'rgba(0,0,0,0.1)',
  margin: '0 4px',
};

const labelDimStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#999',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const selectStyle: React.CSSProperties = {
  appearance: 'auto',
  background: 'transparent',
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  color: 'inherit',
  cursor: 'pointer',
  padding: '4px 2px',
  maxWidth: 180,
};

// ============================================================================
// Register
// ============================================================================

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Brand',
    render: () => <BrandToolbar />,
  });
});
