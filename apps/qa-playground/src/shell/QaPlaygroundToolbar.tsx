import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';
import { IconContained } from '@oneui/ui/components/IconContained';
import { QaBrandToolbarField } from './QaBrandToolbarField';
import toolbarStyles from './qa-brand-toolbar.module.css';
import {
  densityLabel,
  type BrandSource,
  type ThemeChoice,
} from './qaPlaygroundToolbarState';
import type { PlatformEntry } from '@oneui/shared';

function selectLeadingIcon(name: 'document' | 'layers' | 'palette' | 'sun' | 'moon' | 'smartphone' | 'monitor' | 'resize' | 'spacing') {
  return (
    <span className={toolbarStyles.selectLeadingIcon}>
      <IconContained icon={name} size="xs" attention="medium" appearance="primary" aria-hidden />
    </span>
  );
}

const SOURCE_OPTIONS: SelectOption<BrandSource>[] = [
  { value: 'fixture', label: 'Fixture (offline)', icon: selectLeadingIcon('document') },
  { value: 'convex', label: 'Convex (Storybook path)', icon: selectLeadingIcon('layers') },
];

const THEME_OPTIONS: SelectOption<ThemeChoice>[] = [
  { value: 'light', label: 'Light', icon: selectLeadingIcon('sun') },
  { value: 'dark', label: 'Dark', icon: selectLeadingIcon('moon') },
];

const BREAKPOINT_RESPONSIVE = 'responsive';

export function QaPlaygroundToolbar({
  source,
  onSourceChange,
  showConvexBrandControls,
  brandOptions,
  convexBrandId,
  onConvexBrandChange,
  subBrandOptions,
  subBrandId,
  onSubBrandChange,
  platformOptions,
  platformId,
  onPlatformChange,
  breakpointOptions,
  breakpoint,
  onBreakpointChange,
  densityOptions,
  density,
  onDensityChange,
  theme,
  onThemeChange,
}: {
  source: BrandSource;
  onSourceChange: (value: BrandSource) => void;
  showConvexBrandControls: boolean;
  brandOptions: SelectOption<string>[];
  convexBrandId: string;
  onConvexBrandChange: (id: string) => void;
  subBrandOptions: SelectOption<string>[];
  subBrandId: string;
  onSubBrandChange: (id: string) => void;
  platformOptions: SelectOption<string>[];
  platformId: string;
  onPlatformChange: (id: string) => void;
  breakpointOptions: SelectOption<string>[];
  breakpoint: string;
  onBreakpointChange: (value: string) => void;
  densityOptions: SelectOption<string>[];
  density: string;
  onDensityChange: (value: string) => void;
  theme: ThemeChoice;
  onThemeChange: (value: ThemeChoice) => void;
}) {
  return (
    <header className={toolbarStyles.toolbarCard} data-testid="qa-playground-brand-toolbar">
      <div className={toolbarStyles.toolbarRow}>
        <QaBrandToolbarField label="Brand source" htmlFor="qa-brand-source">
          <Select
            id="qa-brand-source"
            value={source}
            onChange={onSourceChange}
            options={SOURCE_OPTIONS}
            size="sm"
            className={toolbarStyles.selectTrigger}
            aria-label="Brand source"
            data-testid="qa-brand-source"
          />
        </QaBrandToolbarField>

        {showConvexBrandControls ? (
          <>
            <div className={toolbarStyles.divider} aria-hidden />
            <QaBrandToolbarField label="Brand" htmlFor="qa-convex-brand">
              <Select
                id="qa-convex-brand"
                value={convexBrandId}
                onChange={onConvexBrandChange}
                options={brandOptions}
                disabled={!brandOptions.some((o) => o.value && !o.disabled)}
                searchable
                size="sm"
                className={toolbarStyles.selectTrigger}
                aria-label="Brand"
                data-testid="qa-convex-brand"
              />
            </QaBrandToolbarField>

            {subBrandOptions.length > 1 ? (
              <>
                <div className={toolbarStyles.divider} aria-hidden />
                <QaBrandToolbarField label="Sub-theme" htmlFor="qa-sub-brand">
                  <Select
                    id="qa-sub-brand"
                    value={subBrandId}
                    onChange={onSubBrandChange}
                    options={subBrandOptions}
                    size="sm"
                    className={toolbarStyles.selectTrigger}
                    aria-label="Sub-theme"
                    data-testid="qa-sub-brand"
                  />
                </QaBrandToolbarField>
              </>
            ) : null}

            <div className={toolbarStyles.divider} aria-hidden />
            <QaBrandToolbarField label="Theme" htmlFor="qa-theme">
              <Select
                id="qa-theme"
                value={theme}
                onChange={onThemeChange}
                options={THEME_OPTIONS}
                size="sm"
                className={toolbarStyles.selectTrigger}
                aria-label="Theme"
                data-testid="qa-theme"
              />
            </QaBrandToolbarField>
          </>
        ) : (
          <QaBrandToolbarField label="Brand">
            <span className={toolbarStyles.offlineValue}>Fixture (offline)</span>
          </QaBrandToolbarField>
        )}

        {platformOptions.length > 0 ? (
          <>
            <div className={toolbarStyles.divider} aria-hidden />
            <QaBrandToolbarField label="Platform" htmlFor="qa-platform">
              <Select
                id="qa-platform"
                value={platformId}
                onChange={onPlatformChange}
                options={platformOptions}
                size="sm"
                className={toolbarStyles.selectTrigger}
                aria-label="Platform"
                data-testid="qa-platform"
              />
            </QaBrandToolbarField>
          </>
        ) : null}

        {breakpointOptions.length > 0 ? (
          <>
            <div className={toolbarStyles.divider} aria-hidden />
            <QaBrandToolbarField label="Viewport" htmlFor="qa-breakpoint">
              <Select
                id="qa-breakpoint"
                value={breakpoint}
                onChange={onBreakpointChange}
                options={breakpointOptions}
                size="sm"
                className={toolbarStyles.selectTrigger}
                aria-label="Viewport breakpoint"
                data-testid="qa-breakpoint"
              />
            </QaBrandToolbarField>
          </>
        ) : null}

        {densityOptions.length > 0 ? (
          <>
            <div className={toolbarStyles.divider} aria-hidden />
            <QaBrandToolbarField label="Density" htmlFor="qa-density">
              <Select
                id="qa-density"
                value={density}
                onChange={onDensityChange}
                options={densityOptions}
                size="sm"
                className={toolbarStyles.selectTrigger}
                aria-label="Density"
                data-testid="qa-density"
              />
            </QaBrandToolbarField>
          </>
        ) : null}
      </div>
    </header>
  );
}

export function platformSelectOptions(platforms: PlatformEntry[]): SelectOption<string>[] {
  return platforms.map((p) => ({
    value: p.id,
    label: p.label,
  }));
}

export function breakpointSelectOptions(
  breakpoints: { id: string; label: string; viewportWidth: number }[],
): SelectOption<string>[] {
  return [
    { value: BREAKPOINT_RESPONSIVE, label: 'Responsive' },
    ...breakpoints.map((bp) => ({
      value: String(bp.viewportWidth),
      label: `${bp.label} (${bp.viewportWidth}px)`,
    })),
  ];
}

export function densitySelectOptions(densities: string[]): SelectOption<string>[] {
  return densities.map((d) => ({
    value: d,
    label: densityLabel(d),
  }));
}

export function subBrandSelectOptions(
  items: { _id: string; name: string }[],
): SelectOption<string>[] {
  return [
    { value: '', label: 'Base brand' },
    ...items.map((s) => ({ value: s._id, label: s.name })),
  ];
}
