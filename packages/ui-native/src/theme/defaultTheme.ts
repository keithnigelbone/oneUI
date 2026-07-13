/**
 * defaultTheme.ts
 *
 * Demo-only seed for `OneUINativeTheme`. Produces a usable theme without a
 * Convex round-trip — useful for local development, screenshots, and the
 * v4-sample style verifier app. Real applications should snapshot
 * `getBrandOverviewData` from Convex (or whatever transport they use) and
 * pass that JSON straight to `buildNativeTheme`.
 *
 * What it generates:
 *   - A custom-source `Neutral` scale derived from `BUILT_IN_NEUTRAL_BASE_COLOR`
 *     (matches what `ensureNeutralRole` would auto-inject anyway).
 *   - A custom-source `Primary` scale derived from `opts.primaryHex` (default
 *     OneUI MyJio1 indigo).
 *   - An appearance config wiring:
 *       primary  → Primary @ 1300
 *       neutral  → Neutral @ 1300
 *
 * Eight other roles (`secondary`, `sparkle`, `positive`, `negative`,
 * `warning`, `informative`, `tertiary`, `quaternary`, `brand-bg`) are NOT
 * configured by the seed. Components that request those appearances will
 * fall back to `neutral` via `useSurfaceTokens`'s built-in fallback chain.
 * If you need them, snapshot a real brand from Convex.
 */

import {
  buildNativeTheme,
  type BuildNativeThemeInput,
  type NativeThemeContext,
  type OneUINativeTheme,
} from '@oneui/shared/engine';

// `BUILT_IN_NEUTRAL_BASE_COLOR` is exported from
// `packages/shared/src/utils/colorScale/types.ts` but isn't re-exported
// from the engine barrel. Inlining as a documented constant rather than
// adding a deep import path so this file stays portable.
// INTENTIONAL-LITERAL: matches `BUILT_IN_NEUTRAL_BASE_COLOR` in
// `packages/shared/src/utils/colorScale/types.ts`. Update both together.
const NEUTRAL_BASE_HEX = '#808080';

/**
 * Default brand colour for the demo theme — matches OneUI MyJio1 indigo
 * (see `apps/v4-sample/src/jdsPalettes.ts` for the authored ramp).
 * INTENTIONAL-LITERAL: brand seed colour, not a token.
 */
const DEFAULT_PRIMARY_HEX = '#3a36e0';

export interface DefaultNativeThemeOptions {
  /** Theme variant. Default `'light'`. */
  theme?: 'light' | 'dark';
  /** Brand primary colour (any 6-digit hex). Default OneUI MyJio1 indigo. */
  primaryHex?: string;
  /** Density preset (carried in meta only — colour resolution unaffected). */
  density?: 'compact' | 'default' | 'open';
  /** Platform preset (carried in meta only). Default `'mobile'`. */
  platform?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Build a minimal `OneUINativeTheme` for development / preview.
 *
 * Use it like:
 * ```tsx
 * <OneUINativeThemeProvider theme={defaultNativeTheme()}>
 *   <Button>Continue</Button>
 * </OneUINativeThemeProvider>
 * ```
 *
 * For production, replace with a real Convex snapshot:
 * ```tsx
 * const theme = useMemo(
 *   () => buildNativeTheme(brandFoundation, { theme: 'light' }),
 *   [brandFoundation],
 * );
 * ```
 */
export function defaultNativeTheme(opts: DefaultNativeThemeOptions = {}): OneUINativeTheme {
  const {
    theme = 'light',
    primaryHex = DEFAULT_PRIMARY_HEX,
    density = 'default',
    platform = 'mobile',
  } = opts;

  const input: BuildNativeThemeInput = {
    colorConfig: {
      brandScales: [
        {
          name: 'Neutral',
          source: 'custom',
          baseColor: NEUTRAL_BASE_HEX,
        },
        {
          name: 'Primary',
          source: 'custom',
          baseColor: primaryHex,
        },
      ],
    },
    appearanceConfig: {
      accents: [
        { role: 'primary', scaleName: 'Primary', baseStep: 1300 },
        { role: 'neutral', scaleName: 'Neutral', baseStep: 1300 },
      ],
    },
  };

  const context: NativeThemeContext = { theme, density, platform };

  const built = buildNativeTheme(input, context);
  if (!built) {
    // `buildNativeTheme` only returns null when the appearance config
    // resolves to zero roles — defensive guard, should never fire here.
    throw new Error(
      '[defaultNativeTheme] Failed to build seed theme. This is a bug — please report.',
    );
  }
  return built;
}
