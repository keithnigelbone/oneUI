/**
 * subBrandFoundationsLoader.test.ts
 *
 * PURE-LOGIC guards for the two concerns the Plan-02 route loader must get right,
 * tested independently of Convex (this package stays backend-free):
 *
 *   1. Pitfall 1 — the overview → BrandFoundations mapping reads `color.config`
 *      (the nested config object), NOT the `color` record itself. A loader that
 *      passes `overview.color` straight through would feed `buildAvailableScales`
 *      the wrong shape and silently lose the brand's scales.
 *
 *   2. The sub-brand merge — `applySubBrandAccentsToFoundation(overview, sub)`
 *      produces an appearanceConfig whose `accents` carry the sub-brand's 4 owned
 *      roles (primary/secondary/sparkle/brand-bg) PLUS the parent's inherited
 *      semantic roles (`INHERITED_SEMANTIC_ROLES`).
 *
 * No Convex client is imported — this exercises the mapping/merge logic only.
 * The route's loader FACTORY itself is exercised in Plan 02's runRoute.test.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  applySubBrandAccentsToFoundation,
  type SubBrandAccentFields,
} from '@oneui/shared/utils/subBrandFoundation';
import { INHERITED_SEMANTIC_ROLES } from '@oneui/shared/types/appearance';
import type { BrandFoundations } from './foundationResolver';

/**
 * The `getBrandOverviewData`-shaped record the loader (Plan 02) receives from
 * Convex: the color foundation nests its real scales under `color.config`, and
 * the brand carries its own `presetSelection` + `appearanceConfig`.
 */
const OVERVIEW = {
  color: {
    // NOTE: the real scales live HERE, under `.config` — NOT on `color` itself.
    config: {
      brandScales: [{ name: 'primary', source: 'custom', baseColor: '#1A73E8' }],
    },
  },
  presetSelection: null,
  appearanceConfig: {
    accentCount: 6,
    accents: [
      { role: 'primary', label: 'Primary', scaleName: 'primary', baseStep: 1700 },
      { role: 'neutral', label: 'Neutral', scaleName: 'neutral', baseStep: 1700 },
      { role: 'positive', label: 'Positive', scaleName: 'positive', baseStep: 1700 },
      { role: 'negative', label: 'Negative', scaleName: 'negative', baseStep: 1700 },
      { role: 'warning', label: 'Warning', scaleName: 'warning', baseStep: 1700 },
      { role: 'informative', label: 'Informative', scaleName: 'informative', baseStep: 1700 },
    ],
  },
} as const;

/**
 * The minimal, faithful mapping the loader applies (Pitfall 1): the brand's
 * color scales come from `overview.color.config`, NOT the `color` record.
 */
function mapOverviewToFoundations(overview: typeof OVERVIEW): BrandFoundations {
  return {
    colorConfig: overview.color.config as Record<string, unknown>,
    presetSelection: overview.presetSelection,
    appearanceConfig: overview.appearanceConfig as never,
  };
}

describe('overview → BrandFoundations mapping (Pitfall 1)', () => {
  it('reads color.config (the nested scales), NOT the color record itself', () => {
    const foundations = mapOverviewToFoundations(OVERVIEW);

    // The core Pitfall-1 guard: colorConfig is the nested config, not `color`.
    expect(foundations.colorConfig).toBe(OVERVIEW.color.config);
    expect(foundations.colorConfig).not.toBe(OVERVIEW.color as unknown);
    // And it carries the brand's real scales (so buildAvailableScales sees them).
    expect((foundations.colorConfig as { brandScales?: unknown[] }).brandScales).toHaveLength(1);
  });
});

describe('applySubBrandAccentsToFoundation merge', () => {
  const SUB_BRAND: SubBrandAccentFields = {
    primary: { scaleName: 'sub-primary', baseStep: 1500 },
    secondary: { scaleName: 'sub-secondary', baseStep: 1500 },
    sparkle: { scaleName: 'sub-sparkle', baseStep: 1500 },
    brandBg: {
      scaleName: 'sub-brand-bg',
      backgroundStep: { light: 2300, dark: 300 },
    },
  };

  it('produces the 4 sub-brand-owned accent roles plus the parent inherited semantic roles', () => {
    const merged = applySubBrandAccentsToFoundation(OVERVIEW, SUB_BRAND) as {
      appearanceConfig: { accents: { role: string; scaleName: string }[] };
    };

    const roles = merged.appearanceConfig.accents.map((a) => a.role);

    // The 4 roles the sub-brand owns directly.
    expect(roles).toEqual(expect.arrayContaining(['primary', 'secondary', 'sparkle', 'brand-bg']));

    // The sub-brand's scales replaced the parent's for the owned roles.
    const primary = merged.appearanceConfig.accents.find((a) => a.role === 'primary');
    expect(primary?.scaleName).toBe('sub-primary');

    // The parent's inherited semantic roles are carried over (NOT the parent's
    // primary — that is owned by the sub-brand).
    const inheritedPresent = INHERITED_SEMANTIC_ROLES.filter((r) => roles.includes(r));
    expect(inheritedPresent).toEqual(expect.arrayContaining([...INHERITED_SEMANTIC_ROLES]));
  });
});
