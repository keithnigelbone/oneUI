/**
 * ComponentThemeContext.tsx
 *
 * Runtime channel for component family-theme overrides on native — the
 * counterpart to the family-theme CSS variables web injects per
 * `componentThemes.ts` (e.g. `--Button-borderRadius: var(--Shape-0)` for
 * `shapeLanguage: 'sharp'`, or transparent bold fill for
 * `emphasisStyle: 'outline'`).
 *
 * Web pipeline:
 *   componentThemeSelections → resolveComponentThemeToOverrides →
 *   CSS custom-property overrides (--Button-borderRadius, background-color, …)
 *
 * Native pipeline:
 *   componentThemeSelections → NativeComponentThemeSelections (per-component
 *   slug with the raw decision values) → React context → component reads its
 *   own slot and converts decision values to RN styles.
 *
 * The context intentionally stores the raw decision strings (e.g.
 * `shapeLanguage: 'sharp'`) rather than resolved pixel values so each
 * component can combine them with the live theme tokens (shape, role paint)
 * without an extra bridge layer.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Native-relevant per-component family theme values.
 *
 * Only the decisions that affect native visual output are carried here.
 * CSS-only decisions (cssDecoration, cssDecorationStrokeWidth, etc.) are
 * omitted because they have no native equivalent.
 */
export interface NativeComponentThemeValues {
  /** From the `actions` / `inputs` / `display` family `shapeLanguage` decision. */
  shapeLanguage?: string;
  /**
   * From the `actions` family legacy `emphasisStyle` decision.
   * @deprecated Aliases `highAttentionStyle`; kept for old brand rows.
   */
  emphasisStyle?: string;
  /** Per-level attention styles (`solid` | `tonal` | `outline` | `quiet`). */
  highAttentionStyle?: string;
  mediumAttentionStyle?: string;
  lowAttentionStyle?: string;
  /** Per-level attention roles (`inherit` or an appearance role slug). */
  highAttentionRole?: string;
  mediumAttentionRole?: string;
  lowAttentionRole?: string;
  /**
   * Raw token refs from the brand component token editor. Keys mirror the
   * tokenName keys used by `buildComponentPreviewStyles` and the web CSS
   * (e.g. `'backgroundColor.bold-pressed'`, `'borderRadius'`). Color values
   * are surface token names like `'Primary-Bold'` or literal CSS values like
   * `'transparent'`; shape values are tokens like `'Shape-3'` or `'Shape-XS'`.
   */
  tokenRefs?: Record<string, string>;
}

/** Selections keyed by lowercase component slug. */
export type NativeComponentThemeSelections = Record<string, NativeComponentThemeValues>;

const ComponentThemeContext = createContext<NativeComponentThemeSelections>({});

export interface ComponentThemeProviderProps {
  overrides?: NativeComponentThemeSelections;
  children: ReactNode;
}

/**
 * Standalone provider — most apps pass `componentThemeOverrides` to
 * `OneUINativeThemeProvider` which mounts this internally.
 */
export function ComponentThemeProvider({
  overrides,
  children,
}: ComponentThemeProviderProps): React.ReactElement {
  const value = useMemo(() => overrides ?? {}, [overrides]);
  return (
    <ComponentThemeContext.Provider value={value}>
      {children}
    </ComponentThemeContext.Provider>
  );
}

/**
 * **Override pattern** — enforced by code review.
 *
 * Components consuming ≥2 theme sources (paint + scalars, or emphasisStyle +
 * shapeLanguage + tokenRefs) MUST centralise all precedence logic in a
 * co-located `resolve{Component}Style.ts` pure function and a thin
 * `use{Component}Style.ts` hook wrapper. The pure function calls
 * `resolveComponentScalarTokens` (from `theme/componentTokenResolver.ts`) for
 * all non-paint scalar properties and handles component-specific paint merge.
 * Components consuming only scalar overrides (no custom paint) can call
 * `useResolvedComponentTokens` directly (see Badge.native.tsx).
 *
 * **Never** write scattered `??` chains for style precedence directly inside a
 * component render body — cross-property coupling (e.g. textTransform →
 * letterSpacing) cannot be correctly enforced when the logic is split across
 * multiple independent variables.
 *
 * Reference implementations: `Button/resolveButtonStyle.ts`,
 * `Chip/resolveChipStyle.ts`, `componentTokenResolver.ts`.
 */

/**
 * Read family-theme values for a given component slug. Returns `{}` when
 * no overrides are set, so callers can destructure without null checks.
 */
export function useComponentTheme(componentSlug: string): NativeComponentThemeValues {
  const all = useContext(ComponentThemeContext);
  return all[componentSlug.toLowerCase()] ?? {};
}
