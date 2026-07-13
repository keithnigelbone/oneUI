/**
 * Icon.showcase.tsx
 *
 * Shared variant display components for Icon.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Icon } from './Icon';
import { ICON_SIZES, type IconEmphasis } from './Icon.shared';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const rowLabelStyle: React.CSSProperties = {
  ...labelStyle,
  minWidth: 'var(--Spacing-9)',
  margin: 0,
};

/** Representative subset of sizes to show in the compact table */
const PREVIEW_SIZES = ['2', '3', '4', '5', '6', '8', '10', '16', '24', '40'] as const;

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * All 20 icon sizes from the dimension f-step scale.
 */
export function IconSizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
      {ICON_SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
          <Icon icon="heart" size={size} aria-label={`Size ${size}`} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-3XS)' }}>{size}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Representative subset of sizes in a table layout matching the platform docs page.
 */
export function IconSizesTable() {
  return (
    <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4-5) var(--Spacing-3-5)' }}>
      <thead>
        <tr>
          <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'left', padding: 'var(--Spacing-3)' }}>Index</th>
          <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'left', padding: 'var(--Spacing-3)' }}>Preview</th>
        </tr>
      </thead>
      <tbody>
        {PREVIEW_SIZES.map((size) => (
          <tr key={size}>
            <td style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)', padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>{size}</td>
            <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}><Icon icon="home" size={size} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * All 5 emphasis levels at size 8 using the primary appearance.
 */
export function IconEmphasisLevels() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
      {(['high', 'medium', 'low', 'tinted', 'tintedA11y'] as IconEmphasis[]).map((emphasis) => (
        <div key={emphasis} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Icon icon="heart" emphasis={emphasis} appearance="primary" size="8" aria-label={emphasis} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>{emphasis}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Emphasis levels in a table layout matching the platform docs page.
 */
export function IconEmphasisLevelsTable() {
  const emphasisLevels: IconEmphasis[] = ['high', 'medium', 'low', 'tinted', 'tintedA11y'];
  return (
    <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4-5) var(--Spacing-3-5)' }}>
      <thead>
        <tr>
          <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'left', padding: 'var(--Spacing-3)' }}>Emphasis</th>
          <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>Preview</th>
        </tr>
      </thead>
      <tbody>
        {emphasisLevels.map((emphasis) => (
          <tr key={emphasis}>
            <td style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)', padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>{emphasis}</td>
            <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle', textAlign: 'center' }}><Icon icon="heart" size="8" emphasis={emphasis} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Icon inline with text — contextual usage examples.
 */
export function IconInContext() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-2)', fontSize: 'var(--Body-M-FontSize)', color: 'var(--Text-High)' }}>
        <Icon icon="heart" size="5" emphasis="tinted" appearance="negative" />
        Favourited item
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-2)', fontSize: 'var(--Body-S-FontSize)', color: 'var(--Text-Medium)' }}>
        <Icon icon="search" size="3.5" emphasis="medium" />
        Search results
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-2)', fontSize: 'var(--Label-S-FontSize)', color: 'var(--Positive-Tinted)' }}>
        <Icon icon="check" size="3" emphasis="tintedA11y" appearance="positive" />
        Verified
      </span>
    </div>
  );
}

/**
 * Multiple semantic icon names from the Jio icon set.
 */
export function IconWithIcons() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      {(['heart', 'star', 'check', 'search', 'settings', 'home'] as const).map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
          <Icon icon={name} size="8" aria-label={name} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-3XS)' }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * All 8 appearance roles × key emphasis levels.
 */
export function IconAppearances() {
  const appearances = [
    'neutral', 'primary', 'secondary', 'sparkle',
    'negative', 'positive', 'warning', 'informative',
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['high', 'tinted', 'tintedA11y'] as IconEmphasis[]).map((emphasis) => (
        <div key={emphasis} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
          <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-10)' }}>{emphasis}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            {appearances.map((app) => (
              <div key={app} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
                <Icon icon="heart" appearance={app} emphasis={emphasis} size="8" aria-label={`${emphasis} ${app}`} />
                <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-3XS)' }}>{app}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
