'use client';

import { createContext, useContext, useMemo } from 'react';
import type { SurfaceToken, MediaContext } from '@oneui/shared/engine';
import {
  SURFACE_STEP_BOLD_LIGHT,
  SURFACE_STEP_BOLD_DARK,
  resolveSurfaceStep,
  roleLabel,
} from '@oneui/shared/engine';
import type { ComponentAppearance } from '@oneui/shared';
import { useDocumentMode } from '../../hooks/useDocumentMode';
import { useBrandScopeMode } from '../../contexts/BrandScopeContext';
import { useBrandFoundation } from '../../contexts/BrandFoundationContext';
import { useMaterialFoundation } from '../../contexts/MaterialFoundationContext';
import { MATERIAL_TRANSPARENT_ENABLED } from '../../featureFlags';
import styles from './Surface.module.css';

// ============================================================================
// Surface step cascade (RFC-0003)
// ============================================================================

/**
 * Resolved state of the nearest ancestor `<Surface>` — passed down to
 * children so a deeper Surface can compute its own step relative to the
 * actual parent rather than the page root.
 *
 * `null` means "no Surface above me — I'm at the page root", in which case
 * the Surface anchors to the theme-appropriate default step
 * (2500 light / 200 dark).
 *
 * `mode` and `appearance` are tracked alongside `step` because the cross-
 * role bold-on-bold rule needs them: when an inner bold Surface sits inside
 * an outer bold Surface with a *different* appearance, the inner anchors
 * to the page root step (not the parent's bold step) so its own scale
 * resolves to its own baseStep — same outcome as if it were at root.
 * Same-appearance bold-on-bold keeps the existing parent-relative
 * behavior (the inner repeats the outer's bold step).
 */
interface SurfaceContextValue {
  step: number;
  mode: SurfaceToken;
  appearance: ComponentAppearance;
  /**
   * When `false`, `useSurfaceAppearance()` returns `null` for descendants so
   * leaf components fall back to their page-root defaults (Badge → sparkle,
   * Stepper → secondary, etc.) while `useSurfaceStep()` and nested
   * `<Surface>` step/appearance resolution still read this node.
   */
  inheritAppearance?: boolean;
}
const SurfaceStepContext = createContext<SurfaceContextValue | null>(null);

/** Default step the page-root surface lives at. */
const ROOT_STEP_LIGHT = 2500;
const ROOT_STEP_DARK = 200;
/** Palette range — the actual emitted scale spans 100–2500 in increments of 100. */
const SCALE_MIN = 100;
const SCALE_MAX = 2500;

/** Clamp a candidate step to the palette range. */
function clampStep(step: number): number {
  if (step < SCALE_MIN) return SCALE_MIN;
  if (step > SCALE_MAX) return SCALE_MAX;
  return step;
}

/**
 * JSX-side approximation of `resolveSurface` from `@oneui/shared/engine`.
 *
 * Used by `<Surface>` to compute its own `data-surface-step` from the
 * inherited parent step. This is a *scale-free* approximation: bold pins
 * to a canonical step (700 light / 1900 dark) rather than the brand's
 * actual baseStep. The brand-aware path in `Surface` itself prefers the
 * full `resolveSurfaceStep` when a `BrandFoundationProvider` is in scope.
 */
function approxResolveStep(
  mode: SurfaceToken,
  parentStep: number,
  darkMode: boolean,
): number {
  const dir = darkMode ? +1 : -1;
  switch (mode) {
    case 'default':
      return darkMode ? ROOT_STEP_DARK : ROOT_STEP_LIGHT;
    case 'ghost':
    case 'blend':
      return parentStep;
    case 'elevated':
      return Math.min(parentStep + 100, SCALE_MAX);
    case 'minimal':
      return clampStep(parentStep + dir * 100);
    case 'subtle':
      return clampStep(parentStep + dir * 200);
    case 'moderate':
      return clampStep(parentStep + dir * 300);
    case 'bold':
      return darkMode ? SURFACE_STEP_BOLD_DARK : SURFACE_STEP_BOLD_LIGHT;
  }
}

/**
 * Hook to read the resolved step of the nearest ancestor `<Surface>`.
 * Returns `null` when called outside any Surface.
 */
export function useSurfaceStep(): number | null {
  const ctx = useContext(SurfaceStepContext);
  return ctx?.step ?? null;
}

/**
 * Resolved multi-accent role of the nearest ancestor `<Surface>` (the
 * `appearance` prop after resolving `'auto'`). Returns `null` outside any
 * Surface — use for inheriting role into leaf components (e.g. Badge) when
 * their own `appearance` is unset or `'auto'`.
 */
export function useSurfaceAppearance(): Exclude<ComponentAppearance, 'auto'> | null {
  const ctx = useContext(SurfaceStepContext);
  if (!ctx || ctx.inheritAppearance === false) return null;
  const role = ctx.appearance;
  if (role === 'auto') return 'primary';
  return role;
}

/**
 * Mode of the nearest ancestor `<Surface>`. Returns `null` outside any Surface
 * (page root). Used by components whose low-attention stroke follows the parent
 * surface role with a neutral fallback (e.g. Badge ghost border).
 */
export function useSurfaceMode(): SurfaceToken | null {
  const ctx = useContext(SurfaceStepContext);
  return ctx?.mode ?? null;
}

/**
 * Detach leaf-component appearance inheritance from an enclosing `<Surface>`
 * without losing the surface fill, `[data-surface]` CSS cascade, or step
 * context for nested surfaces inside a showcase.
 *
 * Use on QA/docs shells that wrap scenarios in `<Surface mode="default">`
 * for card chrome: without this scope, `appearance="auto"` components inherit
 * primary from the shell instead of their Storybook page-root defaults.
 */
export function SurfaceAppearanceScope({ children }: { children: React.ReactNode }) {
  const parent = useContext(SurfaceStepContext);
  const ctxValue = useMemo<SurfaceContextValue | null>(
    () => (parent ? { ...parent, inheritAppearance: false } : null),
    [parent],
  );
  return (
    <SurfaceStepContext.Provider value={ctxValue}>
      {children}
    </SurfaceStepContext.Provider>
  );
}

/** Surface mode — one of the 8 canonical surface tokens. */
export type SurfaceMode = SurfaceToken;

export type SurfaceMaterial = 'solid' | 'transparent';

interface SurfaceBaseProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Surface mode — determines background color and token remapping context.
   * Defaults to `ghost` (inherits parent step, visually transparent, still
   * opts descendants into the `[data-surface]` cascade).
   */
  mode?: SurfaceMode;
  /**
   * Role this Surface renders as. Defaults to `'primary'`. Setting this:
   *
   * - Picks the brand scale used for step resolution (so a `bold` surface
   *   anchors to *this role's* baseStep, not primary's).
   * - Repaints the Surface fill via `--Surface-Self-Color` (depth-N safe;
   *   reads `--{Role}-Self-Color` from the matching step lookup block).
   * - Triggers the cross-role bold-on-bold reset when nested inside
   *   another bold Surface of a different appearance.
   *
   * Descendant content tokens (`--Text-High`, `--Primary-Bold`, etc.)
   * still resolve from the primary scale today — full per-appearance
   * remapping is deferred work (Item D).
   */
  appearance?: ComponentAppearance;
  /** Deprecated generated-composition hint. Consumed so it does not leak to the DOM. */
  fullWidth?: boolean;
  /** Polymorphic element type (default: 'div'). */
  as?: React.ElementType;
}

interface SolidSurfaceProps extends SurfaceBaseProps {
  material?: 'solid';
  mediaContext?: never;
}

interface TransparentSurfaceProps extends SurfaceBaseProps {
  material: 'transparent';
  mediaContext: MediaContext;
}

export type SurfaceProps = SolidSurfaceProps | TransparentSurfaceProps;

export function Surface(props: SurfaceProps) {
  const {
    mode = 'ghost',
    // Default to `auto`: a Surface without an explicit appearance
    // inherits its parent's effective role. At the page root (no Surface
    // ancestor) auto falls back to 'primary'. This keeps `<Surface mode=
    // "ghost">` visually transparent inside any non-primary parent
    // (matches the parent's role) while still allowing explicit override.
    appearance = 'auto',
    material: explicitMaterial,
    as: Component = 'div',
    className,
    children,
    style,
    fullWidth: _fullWidth,
    // Pull mediaContext out of rest so it never lands on the DOM as an
    // unrecognized attribute. (Discriminated-union TS doesn't auto-strip
    // it; explicit destructure required.)
    mediaContext: _mediaContext,
    ...rest
  } = props as SurfaceProps & { mediaContext?: MediaContext };
  const classNames = [styles.surface, className].filter(Boolean).join(' ');

  const parent = useContext(SurfaceStepContext);
  const themeConfig = useBrandFoundation();
  const materialConfig = useMaterialFoundation();
  const scopedMode = useBrandScopeMode();
  const documentMode = useDocumentMode();
  const theme = scopedMode ?? documentMode;

  // Resolve own step.
  //
  // `appearance="auto"` inherits the parent's *inherited* appearance — at
  // root it falls back to 'primary'. Resolution and the cross-role-bold
  // check both run against `inheritedAppearance`, so a chain like
  // primary → auto → primary → auto behaves identically to all-primary
  // (no spurious cross-role reset).
  //
  // Cross-role bold-on-bold rule: when this Surface is bold AND its parent
  // is bold AND the *inherited* appearances differ, treat self as root —
  // anchor to the theme default step (2500 light / 200 dark) so
  // resolveSurface walks bold to *this role's* baseStep instead of
  // repeating the outer bold's step.
  //
  // `inheritedAppearance` is what descendants inherit via context /
  // `useSurfaceAppearance()` — the explicit `appearance` prop (or `auto`
  // resolved through the parent chain).
  //
  // `visualAppearance` is what this Surface paints and stamps on
  // `data-appearance`. Ghost is visually transparent: it always paints as
  // the parent's role even when an explicit `appearance` prop was passed,
  // but still transmits its own `inheritedAppearance` to children.
  const inheritedAppearance: ComponentAppearance =
    appearance === 'auto'
      ? (parent?.appearance ?? 'primary')
      : appearance;

  const visualAppearance: ComponentAppearance =
    mode === 'ghost'
      ? (parent?.appearance ?? 'neutral')
      : inheritedAppearance;

  const ownStep = useMemo(() => {
    const darkMode = theme === 'dark';
    const rootStep = darkMode ? ROOT_STEP_DARK : ROOT_STEP_LIGHT;

    const isCrossRoleBoldOnBold =
      mode === 'bold'
      && parent?.mode === 'bold'
      && parent.appearance !== inheritedAppearance;

    const isRoot = parent === null || isCrossRoleBoldOnBold;
    const parentStep = isRoot ? rootStep : parent.step;

    if (themeConfig) {
      const scale =
        themeConfig.appearances[visualAppearance]
        ?? themeConfig.appearances['primary']
        ?? themeConfig.appearances['neutral']
        ?? Object.values(themeConfig.appearances)[0];
      if (scale) {
        return resolveSurfaceStep(scale, parentStep, mode, darkMode, isRoot);
      }
    }
    return approxResolveStep(mode, parentStep, darkMode);
  }, [mode, inheritedAppearance, visualAppearance, parent, theme, themeConfig]);

  // Per-appearance Self-Color: when the visual role isn't primary,
  // point --Surface-Self-Color at this role's step-keyed self color
  // (--Positive-Self-Color, etc.). The matching step block emits one
  // --{Role}-Self-Color per role per step, so this is depth-N safe.
  //
  // Note: descendant content tokens (--Text-High, --Primary-Bold,
  // etc.) still resolve from the primary scale today. That's deferred
  // Item D — the proper fix is engine-side `[data-appearance="<role>"]`
  // redirect blocks that remap every --Text-* alias once. Done at the
  // root level (not per-step), so it's cheap.
  const appearanceStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (visualAppearance === 'primary') return undefined;
    const label = roleLabel(visualAppearance);
    return {
      ['--Surface-Self-Color' as string]: `var(--${label}-Self-Color)`,
      ['--Text-High' as string]: `var(--${label}-High)`,
      ['--Text-Medium' as string]: `var(--${label}-Medium-Text)`,
      ['--Text-Low' as string]: `var(--${label}-Low)`,
      ['--Text-OnBold-High' as string]: `var(--${label}-Bold-High)`,
    };
  }, [visualAppearance]);
  const mergedStyle =
    appearanceStyle || style
      ? { ...appearanceStyle, ...style }
      : undefined;

  const dataAttrs: Record<string, string> = {
    'data-surface': mode,
    'data-surface-step': String(ownStep),
    // Always emit data-appearance, including primary. Without an explicit
    // primary block, a primary descendant of a non-primary ancestor would
    // inherit the ancestor's --Text-* redirects (CSS custom-property
    // inheritance has no auto-revert). The primary block re-pins everything
    // back to primary's tokens.
    'data-appearance': visualAppearance,
  };
  // Single chokepoint for material resolution — covers all three paths:
  // explicit `material` prop, `MaterialFoundationProvider` default, and the
  // CDN-loaded brand config (which feeds the provider). `transparent` is a WIP
  // glass/material system gated behind a build-time flag; in the published
  // library the flag is OFF, so every transparent request coerces to `solid`
  // here and `data-material` / `data-media` are never emitted (the experimental
  // CSS stays inert). See `featureFlags.ts`.
  const requestedMaterial = explicitMaterial ?? materialConfig.defaultMaterialMode;
  const effectiveMaterial: SurfaceMaterial =
    requestedMaterial === 'transparent' && !MATERIAL_TRANSPARENT_ENABLED
      ? 'solid'
      : requestedMaterial;

  if (
    process.env.NODE_ENV !== 'production' &&
    requestedMaterial === 'transparent' &&
    !MATERIAL_TRANSPARENT_ENABLED
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      '[OneUI] Surface material="transparent" is experimental and disabled in ' +
        'this build; falling back to "solid".',
    );
  }

  const effectiveMediaContext =
    effectiveMaterial === 'transparent'
      ? (_mediaContext ?? materialConfig.defaultMediaContext)
      : undefined;

  if (effectiveMaterial === 'transparent') {
    dataAttrs['data-material'] = 'transparent';
    dataAttrs['data-media'] = effectiveMediaContext ?? 'dynamic';
  }

  // Context carries `inheritedAppearance` so ghost can paint as the parent
  // role while still transmitting its own `appearance` prop to descendants.
  const ctxValue = useMemo<SurfaceContextValue>(
    () => ({ step: ownStep, mode, appearance: inheritedAppearance }),
    [ownStep, mode, inheritedAppearance],
  );

  return (
    <SurfaceStepContext.Provider value={ctxValue}>
      <Component
        {...dataAttrs}
        className={classNames}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </Component>
    </SurfaceStepContext.Provider>
  );
}
