/**
 * Structured core invariants — replaces the hard-coded markdown blob at
 * `/Users/.../packages/shared/src/agent/knowledgeSources.ts:10-80` (the
 * web-flavoured CORE_INVARIANTS template literal).
 *
 * Each per-SDK package implements `renderInvariants(coreInvariants, sdk)`
 * that converts these objects into SDK-idiomatic prose:
 *   - web → "use var(--Primary-Bold)"
 *   - rn  → "use tokens.color.primary.bold or useSurfaceTokens('primary').surfaces.bold"
 *   - ios → "use JDSColor.primary(.bold)"
 *   - android → "use JDSTheme.colors.primary.bold"
 *   - flutter → "use JDSTheme.of(context).primary.bold"
 *
 * NEVER hardcode platform syntax in this file.
 */

import {
  ATTENTION_LEVELS,
  ATTENTION_TO_SURFACE,
  COLOR_ROLES,
  SURFACE_MODES,
  type AttentionLevel,
  type ColorRole,
  type SurfaceMode,
} from './roles';
import type { ShapeScale } from './tokens';
import type { SchemaVersion } from './version';

export interface ZeroLiteralsRule {
  readonly forbiddenLiteralKinds: readonly ('hex' | 'rgb' | 'hsl' | 'oklch' | 'named-color' | 'px' | 'em' | 'rem')[];
  readonly forbiddenLiteralRegexp: readonly string[];   // platform binders use; e.g. "^#[0-9a-fA-F]{3,8}$"
  readonly use: 'token';
}

export interface SurfaceRules {
  readonly modes: typeof SURFACE_MODES;
  readonly mandatoryWrapperOnNonDefault: true;
  readonly attentionToSurface: typeof ATTENTION_TO_SURFACE;
  readonly forbidDecorativeStrokeOnTintedSurface: true;
}

export interface ShapeDefaults {
  readonly button: 'pill';
  readonly interactiveControl: ShapeScale;   // input / chip / select default
  readonly nonInteractiveContainer: 'token-driven';
  readonly circular: 'pill';
}

export interface FocusHaloRules {
  readonly innerGapTokenName: '--Surface-Halo-Gap';
  readonly outerHaloTokenName: '--Focus-Outline';
  readonly forbiddenFallback: '--Surface-Main';
}

export interface CoreInvariants {
  readonly schemaVersion: SchemaVersion;
  readonly zeroLiterals: ZeroLiteralsRule;
  readonly surfaces: SurfaceRules;
  readonly shapeDefaults: ShapeDefaults;
  readonly focusHalo: FocusHaloRules;
  readonly tokenNamingConvention: {
    readonly surfaceFill: '--{Role}-{Mode}';
    readonly contentToken: '--{Role}-{ContentSlot}';
    readonly onBoldContent: '--{Role}-Bold-{ContentSlot}';
    readonly stateToken: '--{Role}-{Mode}-{State}';
    readonly typography: '--{Role}-{Size}-FontSize';
  };
  /**
   * 11 multi-accent appearance roles. Top-level so consumers reading
   * `invariants.json` don't have to dig into the surfaces.attentionToSurface
   * mapping or import a TS const. DevLens's federation adapter consumes this
   * directly to fail any meta that claims a role not in this allowlist.
   */
  readonly roles: typeof COLOR_ROLES;
  /**
   * Figma attention vocabulary. Pair with `surfaces.attentionToSurface` to
   * resolve high → bold / medium → subtle / low → ghost.
   */
  readonly attentionLevels: typeof ATTENTION_LEVELS;
}

/** The single literal instance — frozen, structurally validated by smoke test. */
export const CORE_INVARIANTS: CoreInvariants = {
  schemaVersion: '5.0.0',
  zeroLiterals: {
    forbiddenLiteralKinds: ['hex', 'rgb', 'hsl', 'oklch', 'named-color', 'px', 'em', 'rem'],
    forbiddenLiteralRegexp: [
      '^#[0-9a-fA-F]{3,8}$',
      '^rgba?\\(',
      '^hsla?\\(',
      '^oklch\\(',
      '\\b\\d+(\\.\\d+)?(px|em|rem)\\b',
    ],
    use: 'token',
  },
  surfaces: {
    modes: SURFACE_MODES,
    mandatoryWrapperOnNonDefault: true,
    attentionToSurface: ATTENTION_TO_SURFACE,
    forbidDecorativeStrokeOnTintedSurface: true,
  },
  shapeDefaults: {
    button: 'pill',
    interactiveControl: '3XS',
    nonInteractiveContainer: 'token-driven',
    circular: 'pill',
  },
  focusHalo: {
    innerGapTokenName: '--Surface-Halo-Gap',
    outerHaloTokenName: '--Focus-Outline',
    forbiddenFallback: '--Surface-Main',
  },
  tokenNamingConvention: {
    surfaceFill: '--{Role}-{Mode}',
    contentToken: '--{Role}-{ContentSlot}',
    onBoldContent: '--{Role}-Bold-{ContentSlot}',
    stateToken: '--{Role}-{Mode}-{State}',
    typography: '--{Role}-{Size}-FontSize',
  },
  roles: COLOR_ROLES,
  attentionLevels: ATTENTION_LEVELS,
} as const;

/** Re-exported for binder convenience. */
export type { AttentionLevel, ColorRole, SurfaceMode };
