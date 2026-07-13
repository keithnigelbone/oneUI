/**
 * Brand foundation shape — the post-snapshot, kb-side projection of Convex's
 * `brands` + `foundations` + `colorScales` tables. Authoring lives in OneUI
 * (Convex); kb-core ships a static snapshot per release.
 *
 * The runtime path is deliberately NOT live. Per-release snapshot via
 * scripts/snapshot-brands.ts in OneUI CI; brand updates wait for the next
 * JDS release.
 */

import type { ColorRole } from './roles';
import type { BrandSetVersion } from './version';

export interface OkLchTriple {
  readonly L: number;  // 0..1
  readonly C: number;  // 0..0.4 (chroma cap)
  readonly h: number;  // 0..360
}

/** One step of a 25-step OkLCH scale (100..2500 in steps of 100). */
export interface ColorScaleStep {
  readonly step: number;       // 100, 200, ..., 2500
  readonly hex: string;        // resolved hex
  readonly oklch: OkLchTriple;
}

export interface ColorScale {
  readonly name: string;       // e.g. 'Primary', 'Neutral', 'Sparkle'
  readonly baseStep: number;   // 100..2500 — where the scale anchors for `bold`
  readonly steps: readonly ColorScaleStep[];
  readonly anchorBoldToBaseStep?: boolean;
}

export interface FontReference {
  readonly family: string;          // resolved family name (matches `useFonts` key on native)
  readonly source: 'system' | 'bundled' | 'uploaded';
  readonly assetPath?: string;      // when bundled / uploaded
}

export interface BrandFonts {
  readonly primary: FontReference;
  readonly secondary?: FontReference;
  readonly code?: FontReference;
}

/** Orthogonal theme modifiers stack on top of a brand foundation. */
export interface ThemeModifiers {
  readonly dark: boolean;
  readonly rtl: boolean;
  readonly highContrast: boolean;
}

/** Recipe overrides — JDS authoring side calls these "decision selections". */
export type RecipeSelections = Readonly<Record<string, Readonly<Record<string, string>>>>;

export interface BrandFoundation {
  readonly brandId: string;          // slug-form, e.g. 'jio-mobile'
  readonly displayName: string;
  readonly status: 'active' | 'draft' | 'deprecated';
  readonly primary: OkLchTriple;
  readonly secondary: OkLchTriple;
  readonly scales: readonly ColorScale[];
  readonly activeRoles: readonly ColorRole[];
  readonly fonts: BrandFonts;
  readonly recipes: RecipeSelections;
  readonly defaultModifiers: ThemeModifiers;
  readonly brandSetVersion: BrandSetVersion;
  /**
   * Echo of the Convex snapshot timestamp. Consumers surface this in their
   * build output so humans can correlate a generated build with a specific
   * brand state.
   */
  readonly snapshottedAt: string;
}

/**
 * Discovery — both functions are pure, read from `dist/brands/<id>.json` at
 * runtime. `resolveBrandFromConfig` is the convention path:
 *
 *   const brand = resolveBrandFromConfig(); // reads ./oneui.config.json
 *   const brand = getBrand('jio-mobile');   // explicit
 */
export declare function getBrand(brandId: string): BrandFoundation;
export declare function listBrands(): readonly string[];
export declare function resolveBrandFromConfig(cwd?: string): BrandFoundation;
