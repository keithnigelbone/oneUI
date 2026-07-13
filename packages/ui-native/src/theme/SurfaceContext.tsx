/**
 * SurfaceContext.tsx
 *
 * Native equivalent of web's `[data-surface]` cascade. Each `<Surface>`
 * boundary computes its own resolved step using the same engine algorithm
 * web uses for `[data-surface]` token remapping, then provides a new
 * context to descendants. Components read role-resolved tokens from the
 * current context via `useSurfaceTokens(appearance)`.
 *
 * Two contexts:
 *   ThemeContext   — top-level OneUINativeTheme (immutable for an app session)
 *   SurfaceContext — per-boundary resolved roles at the current parentStep
 *
 * `<Surface>` calls `resolveSurface` + `resolveNativeContextRoles` from
 * `@oneui/shared/engine` and pushes a new SurfaceContext to descendants.
 * The boundary value is cached via useRef so unchanged parent step / dark
 * mode / themeConfig don't emit a new context object on every render.
 */

import React, { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  useBrandMaterial,
  useRoleMaterial,
  type MaterialAssignmentTarget,
} from './MaterialContext';
import { MetallicGradientFill } from '../components/MetallicGradientFill';
import { extractMetallicPreset } from '../utils/metallicPaint';
import { resolveLayoutStyle, type LayoutSpacingProps } from '../utils/layoutStyle';
import {
  computeContrastDir,
  hexToRgbTuple,
  preParseRGBPalette,
  resolveNativeContextRoles,
  resolveSurface,
  type NativeRoleTokens,
  type OneUINativeTheme,
  type ResolvedNativeElevation,
  type ScaleDefinition,
  type SurfaceToken,
  type ThemeConfig,
} from '@oneui/shared/engine';
import type { ComponentAppearance } from '@oneui/shared';
import { RecipeProvider, type RecipeSelections } from './RecipeContext';
import {
  ComponentThemeProvider,
  useComponentTheme,
  type NativeComponentThemeSelections,
} from './ComponentThemeContext';
import { ReduceMotionProvider } from './ReduceMotionContext';
import { MotionProvider, type MotionOverrides } from './MotionContext';

// ============================================================================
// Theme context — top-level, exposes the OneUINativeTheme verbatim
// ============================================================================

const ThemeContext = createContext<OneUINativeTheme | null>(null);

export function useOneUITheme(): OneUINativeTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useOneUITheme must be called inside <OneUINativeThemeProvider>.');
  }
  return theme;
}

/** Resolved elevation levels from `OneUINativeTheme.elevation` (Convex / Jio defaults). */
export function useElevation(): ResolvedNativeElevation {
  return useOneUITheme().elevation;
}

/** Returns the current theme, or `null` if none is mounted. Use for fallbacks. */
export function useOptionalOneUITheme(): OneUINativeTheme | null {
  return useContext(ThemeContext);
}

// ============================================================================
// Surface context — per-boundary, replaces web's `[data-surface]`
// ============================================================================

export interface SurfaceContextValue {
  /** Step the current container is painted at. Children resolve against this. */
  parentStep: number;
  darkMode: boolean;
  themeConfig: ThemeConfig;
  /** Roles already resolved at `parentStep`. `useSurfaceTokens` reads from here. */
  resolvedRoles: Record<string, NativeRoleTokens>;
  /** Resolved appearance of this surface boundary. Omitted at the page root. */
  appearance: ComponentAppearance | null;
}

const SurfaceContext = createContext<SurfaceContextValue | null>(null);

/**
 * Hook to read the resolved appearance of the nearest ancestor `<Surface>`.
 * Returns `null` when called outside any Surface.
 */
export function useSurfaceAppearance(): Exclude<ComponentAppearance, 'auto'> | null {
  const ctx = useContext(SurfaceContext);
  const role = ctx?.appearance;
  if (!role) return null;
  if (role === 'auto') return 'primary';
  return role as Exclude<ComponentAppearance, 'auto'>;
}

/**
 * Read role-resolved tokens at the current surface boundary.
 *
 * `appearance` defaults to `'neutral'` — components without an explicit role
 * pick up the neutral colour family, matching the web fallback chain.
 */
/**
 * Read role-resolved tokens at the current surface boundary.
 *
 * Fallback chain when the requested appearance isn't configured by the
 * active brand:
 *   1. `appearance` (e.g. `'sparkle'`)
 *   2. `'primary'` — matches what web's CSS Modules cascade to via
 *      `var(--Sparkle-Bold, var(--Surface-Bold))` where `--Surface-Bold`
 *      resolves at the page's primary-derived bold step.
 *   3. `'neutral'` — last resort if a brand somehow ships neither.
 *
 * Without the primary step, an unconfigured role on native used to fall
 * straight to neutral (gray), while web rendered the brand colour via
 * `--Surface-Bold`. That asymmetry is why sparkle / tertiary / quaternary
 * looked "different" on native for brands that don't define those scales.
 */
export function useSurfaceTokens(appearance: string = 'neutral'): NativeRoleTokens {
  const ctx = useContext(SurfaceContext);
  if (!ctx) {
    throw new Error('useSurfaceTokens must be called inside <OneUINativeThemeProvider>.');
  }
  return ctx.resolvedRoles[appearance] ?? ctx.resolvedRoles.primary ?? ctx.resolvedRoles.neutral;
}

/** Read the current surface boundary value. Power-user escape hatch. */
export function useSurfaceContext(): SurfaceContextValue {
  const ctx = useContext(SurfaceContext);
  if (!ctx) {
    throw new Error('useSurfaceContext must be called inside <OneUINativeThemeProvider>.');
  }
  return ctx;
}

/**
 * Re-anchor descendants to page-root role tokens without painting a fill.
 * Carousel slide button groups only — import via `carouselRootSurface.native`.
 * @internal Not part of the public `@oneui/ui-native` theme API.
 */
export function RootSurfaceProvider({ children }: { children: ReactNode }): React.ReactElement {
  const theme = useOneUITheme();
  const rootCtx = useMemo<SurfaceContextValue>(
    () => ({
      parentStep: theme.rootParentStep,
      darkMode: theme.darkMode,
      themeConfig: theme.themeConfig,
      resolvedRoles: theme.rootRoles,
      appearance: null,
    }),
    [theme],
  );
  return <SurfaceContext.Provider value={rootCtx}>{children}</SurfaceContext.Provider>;
}

// ============================================================================
// <OneUINativeThemeProvider>
// ============================================================================

export interface OneUINativeThemeProviderProps {
  /** The resolved theme. Pass `null` while loading; consumers see null. */
  theme: OneUINativeTheme | null;
  /**
   * Optional recipe selections for components in this scope. Shape:
   * `{ button: { cornerRadius: 'pill', textTransform: 'uppercase' } }`.
   * Mirrors what the web brand pipeline injects as CSS custom-property
   * overrides — see `Button.recipe.ts` for the available decisions.
   */
  recipeOverrides?: RecipeSelections;
  /**
   * Component family-theme overrides derived from `componentThemeSelections`
   * (shapeLanguage, emphasisStyle per component slug). Native peer of the CSS
   * variables web injects via `resolveComponentThemeToOverrides`.
   */
  componentThemeOverrides?: NativeComponentThemeSelections;
  /**
   * Optional motion-token overrides — applies to every component that
   * consumes `useMotion()` (Button tap-scale, Spinner rotation, etc.).
   * Pass a partial; unspecified fields fall through to `theme.motion` (or
   * Jio defaults when `theme` is null).
   * Mirrors web's CSS motion custom-property cascade.
   */
  motionOverrides?: MotionOverrides;
  children: ReactNode;
}

export function OneUINativeThemeProvider({
  theme,
  recipeOverrides,
  componentThemeOverrides,
  motionOverrides,
  children,
}: OneUINativeThemeProviderProps) {
  // Memoise the root surface boundary so unchanged theme references don't
  // emit a new context object every render.
  const rootSurface = useMemo<SurfaceContextValue | null>(() => {
    if (!theme) return null;
    return {
      parentStep: theme.rootParentStep,
      darkMode: theme.darkMode,
      themeConfig: theme.themeConfig,
      resolvedRoles: theme.rootRoles,
      appearance: null,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <SurfaceContext.Provider value={rootSurface}>
        <RecipeProvider recipeOverrides={recipeOverrides}>
          <ComponentThemeProvider overrides={componentThemeOverrides}>
            <MotionProvider baseMotion={theme?.motion ?? null} overrides={motionOverrides}>
              <ReduceMotionProvider>{children}</ReduceMotionProvider>
            </MotionProvider>
          </ComponentThemeProvider>
        </RecipeProvider>
      </SurfaceContext.Provider>
    </ThemeContext.Provider>
  );
}

// ============================================================================
// <Surface> — per-boundary cascade
// ============================================================================

export interface SurfaceProps extends LayoutSpacingProps {
  /** Surface mode — same 7 tokens as web's `[data-surface]`. */
  mode: SurfaceToken;
  /** Appearance role used to fetch this boundary's fill colour. Default: `'auto'`. */
  appearance?: ComponentAppearance;
  /**
   * Metallic auto-swap for `mode='bold'`.
   * - `'auto'` (default): renders the registered metallic gradient when the active brand
   *   assigns a material to this role and `initOneUIMaterials()` has been called.
   * - `'none'`: always renders the solid role Bold token regardless of brand assignment.
   */
  material?: 'auto' | 'none';
  /** Inline style — applied AFTER the resolved background. */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing. */
  testID?: string;
  children?: ReactNode;
}

/**
 * Strip `anchorBoldToBaseStep` from every scale in a ThemeConfig.
 *
 * Mirrors the shared engine's `resolveContextTokenSet` behaviour: at the
 * root, the anchor pins `--{Role}-Bold` to `scale.baseStep` so brand fills
 * stay recognisable. Inside a non-default surface boundary (the cascade
 * scenario), keeping the anchor would land bold-variant components on the
 * exact same step as the surface they sit on — invisible against a bold
 * surface. Stripping the anchor lets `resolveSurface('bold', containerStep)`
 * compute a contrasting offset (~700 steps lighter via the bold fallback).
 *
 * Without this, `<Button variant='bold'>` placed inside `<Surface mode='bold'>`
 * rendered as the same dark purple as the surface fill. With this, the
 * button renders at the offset step — matching what web's `[data-surface="bold"]`
 * CSS remap does in `cssGenNew.ts`.
 */
function stripAnchors(themeConfig: ThemeConfig): ThemeConfig {
  const stripped: Record<string, ScaleDefinition> = {};
  for (const [role, scale] of Object.entries(themeConfig.appearances)) {
    stripped[role] = scale.anchorBoldToBaseStep
      ? { ...scale, anchorBoldToBaseStep: undefined }
      : scale;
  }
  return { ...themeConfig, appearances: stripped };
}

/**
 * Resolves a child boundary state from the current parent context + a
 * surface mode + appearance. Pure — same inputs produce same output.
 */
// INTENTIONAL-LITERAL: '#ffffff' is the absolute fallback when neither the
// parent step nor step 2500 exists in the scale palette — should never
// fire in a well-formed brand foundation, but keeps the resolver
// total-function. RGB-to-hex math here doesn't have a token equivalent.
function resolveSurfaceBoundary(
  parent: SurfaceContextValue,
  scale: ScaleDefinition,
  mode: SurfaceToken,
  appearance: ComponentAppearance
): { childState: SurfaceContextValue; fillHex: string | undefined } {
  const rgbPalette = preParseRGBPalette(scale.palette);
  const parentHex = scale.palette[parent.parentStep] ?? scale.palette[2500];
  const parentRgb = hexToRgbTuple(parentHex ?? '#ffffff');
  const dir = computeContrastDir(parentRgb, rgbPalette);
  const childStep = resolveSurface(mode, parent.parentStep, scale, dir, parent.darkMode);
  // Anchors are stripped for descendant contexts — see stripAnchors() above.
  // Root tokens still use the anchored config (set by OneUINativeThemeProvider
  // from `theme.rootRoles`), so brand bold fills at the page level stay pinned
  // to baseStep. Only the per-Surface descendant cascade strips.
  const childRoles = resolveNativeContextRoles(
    stripAnchors(parent.themeConfig),
    childStep,
    parent.darkMode
  );
  // Ghost mode keeps the parent fill — descendants paint over it without
  // changing the visual surface; we deliberately omit `backgroundColor` so
  // the parent's background cascades.
  const fillHex = mode === 'ghost' ? undefined : scale.palette[childStep];

  return {
    childState: {
      parentStep: childStep,
      darkMode: parent.darkMode,
      themeConfig: parent.themeConfig,
      resolvedRoles: childRoles,
      appearance,
    },
    fillHex,
  };
}

export function Surface({
  mode,
  appearance = 'auto',
  material = 'auto',
  style,
  testID,
  children,
  ...layoutProps
}: SurfaceProps) {
  const parent = useContext(SurfaceContext);
  if (!parent) {
    throw new Error('Surface must be rendered inside <OneUINativeThemeProvider>.');
  }
  // Token-resolved auto-layout (direction/gap/padding/align). No-op when unset.
  const theme = useOptionalOneUITheme();
  const layoutStyle = resolveLayoutStyle(layoutProps, theme?.spacing);

  const inheritedAppearance: ComponentAppearance =
    appearance === 'auto'
      ? (parent?.appearance ?? 'primary')
      : appearance;

  const visualAppearance: ComponentAppearance =
    mode === 'ghost'
      ? (parent?.appearance ?? 'neutral')
      : inheritedAppearance;
  // Hooks must be called unconditionally at top level.
  const roleMaterial = useRoleMaterial(appearance as MaterialAssignmentTarget);
  const componentTheme = useComponentTheme('surface');
  const brandMaterials = useBrandMaterial();

  // Cache previous boundary inputs so we don't re-emit a new SurfaceContext
  // value when nothing changed. React Context skips re-renders on
  // referential equality of `value`, so this is a meaningful optimisation
  // when sibling state changes force this <Surface> to re-render.
  const cacheRef = useRef<{
    parentStep: number;
    darkMode: boolean;
    themeConfig: ThemeConfig;
    mode: SurfaceToken;
    appearance: ComponentAppearance;
    childState: SurfaceContextValue;
    fillHex: string | undefined;
  } | null>(null);

  const scale =
    parent.themeConfig.appearances[visualAppearance as Exclude<ComponentAppearance, 'auto'>] ?? parent.themeConfig.appearances.neutral;

  const cached = cacheRef.current;
  if (
    !cached ||
    cached.parentStep !== parent.parentStep ||
    cached.darkMode !== parent.darkMode ||
    cached.themeConfig !== parent.themeConfig ||
    cached.mode !== mode ||
    cached.appearance !== inheritedAppearance
  ) {
    const { childState, fillHex } = resolveSurfaceBoundary(
      parent,
      scale,
      mode,
      inheritedAppearance
    );
    cacheRef.current = {
      parentStep: parent.parentStep,
      darkMode: parent.darkMode,
      themeConfig: parent.themeConfig,
      mode,
      appearance: inheritedAppearance,
      childState,
      fillHex,
    };
  }

  const { childState, fillHex } = cacheRef.current!;

  // Resolve gradient from either the role-level materialAssignments (auto-swap)
  // or from per-Surface tokenRefs (mirrors Button's applyTokenRefsToPaint path).
  let activeGradient = roleMaterial;
  if (!activeGradient && mode === 'bold' && material !== 'none' && componentTheme.tokenRefs) {
    const bgRef =
      componentTheme.tokenRefs[`backgroundColor.bold`] ??
      componentTheme.tokenRefs['backgroundColor'];
    if (bgRef) {
      const preset = extractMetallicPreset(bgRef, 'Fill');
      if (preset) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeGradient = (brandMaterials?.metallic as any)?.[preset] ?? null;
      }
    }
  }

  const useMetallic = mode === 'bold' && material !== 'none' && activeGradient != null;
  const [surfaceDims, setSurfaceDims] = useState<{ w: number; h: number } | null>(null);

  const backgroundStyle: ViewStyle | undefined = fillHex ? { backgroundColor: fillHex } : undefined;

  if (useMetallic) {
    const gradient = activeGradient!;
    // Read borderRadius from style (callers set this via style={{ borderRadius }})
    const borderRadius = ((style as ViewStyle | null | undefined)?.borderRadius as number) ?? 0;
    return (
      <View
        style={[{ overflow: 'hidden' }, layoutStyle, style]}
        testID={testID}
        onLayout={(e) =>
          setSurfaceDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        {surfaceDims && (
          <MetallicGradientFill
            colors={gradient.colors}
            locations={gradient.locations}
            strokeColors={gradient.strokeColors}
            strokeLocations={gradient.strokeLocations}
            angle={gradient.angle}
            width={surfaceDims.w}
            height={surfaceDims.h}
            borderRadius={borderRadius}
          />
        )}
        <SurfaceContext.Provider value={childState}>{children}</SurfaceContext.Provider>
      </View>
    );
  }

  return (
    <View style={[backgroundStyle, layoutStyle, style]} testID={testID}>
      <SurfaceContext.Provider value={childState}>{children}</SurfaceContext.Provider>
    </View>
  );
}
