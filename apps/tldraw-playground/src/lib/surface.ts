// One UI surface ladder — the single source of truth for container backgrounds.
//
// Surfaces are NOT free-form colours. Every container picks a level from this
// fixed design-system scale, and rendering goes through the DS's `[data-surface]`
// context mechanism (see packages/shared/src/engine/cssGenNew.ts → ui.css).
//
// Setting `data-surface="<level>"` on a container element does two things:
//   1. Paints the surface fill:
//        background-color: var(--Surface-Self-Color,
//                              var(--Surface-Fill-<level>, var(--Surface-<level>)))
//   2. Remaps inner Text / Border / hover-pressed tokens so descendants keep
//      correct contrast — e.g. a `bold` surface flips text to the on-bold colour
//      automatically, with no manual colour handling here.
//
// `ghost` paints transparent — use it for nested layout containers (a Stack used
// purely for layout) that must NOT draw their own surface over the parent.

import type { CSSProperties } from 'react'
import {
  T,
  createShapePropsMigrationIds,
  createShapePropsMigrationSequence,
  useEditor,
  type Editor,
  type TLShapeId,
} from 'tldraw'
import { useValue } from '@tldraw/state-react'

export type SurfaceLevel = 'ghost' | 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold'

// ── Appearance / role ───────────────────────────────────────────────────────
//
// A surface has TWO dimensions: the LEVEL (above — how much attention) and the
// APPEARANCE/role (what semantic colour). `neutral` is achromatic; `primary` is
// the brand; the rest are semantic. A `bold` surface is near-black when neutral,
// brand-purple when primary, green when positive, etc. The role's fill comes from
// the step-keyed `--{Role}-Self-Color` token (resolved at the surface's step),
// mirroring the One UI <Surface> component's appearance handling.

// `auto` is the context-aware default: a surface (or component) with `auto`
// INHERITS the role of the surface behind it — walking up until it hits an
// explicit role, or 'neutral' at the page root. This is how One UI's <Surface
// appearance="auto"> works; we resolve it from the tldraw parent chain because
// there's no <Surface> React context to inherit through here.
export type ResolvedAppearance =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative'
export type SurfaceAppearance = ResolvedAppearance | 'auto'

export const SURFACE_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly SurfaceAppearance[]

export const appearanceValidator = T.literalEnum(
  'auto',
  'neutral',
  'primary',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
)

/** Inspector enum options for the shared "Appearance" control. Auto first (the
 *  default — inherits the surface behind it). */
export const APPEARANCE_SCHEMA_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'warning', label: 'Warning' },
  { value: 'informative', label: 'Informative' },
] as const

/** DS token prefix for a role, e.g. 'positive' → 'Positive' (for --Positive-Self-Color). */
function roleLabel(appearance: ResolvedAppearance): string {
  return appearance.charAt(0).toUpperCase() + appearance.slice(1)
}

export const SURFACE_LEVELS = [
  'ghost',
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
] as const satisfies readonly SurfaceLevel[]

/** Shared tldraw prop validator for a container's `background`/surface prop. */
export const surfaceValidator = T.literalEnum(
  'ghost',
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
)

/** Inspector enum options for the shared "Surface" control. Default first (the
 *  usual choice), Ghost last (the transparent / "no surface" option). */
export const SURFACE_SCHEMA_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'bold', label: 'Bold' },
  { value: 'ghost', label: 'Ghost' },
] as const

// Surface fill, using the design system's own var chain (root-pinned tokens,
// confirmed loaded: --Surface-Fill-* → --Surface-* fallback). We paint this
// inline rather than relying on the DS `[data-surface]` background rule, because
// that rule is CSS-module-scoped to the One UI <Surface> component's class,
// which these tldraw shape divs don't carry. `ghost` paints nothing.
export const SURFACE_FILL: Record<SurfaceLevel, string> = {
  ghost: 'transparent',
  default: 'var(--Surface-Fill-Default, var(--Surface-Default))',
  minimal: 'var(--Surface-Fill-Minimal, var(--Surface-Minimal))',
  subtle: 'var(--Surface-Fill-Subtle, var(--Surface-Subtle))',
  moderate: 'var(--Surface-Fill-Moderate, var(--Surface-Subtle))',
  bold: 'var(--Surface-Fill-Bold, var(--Surface-Bold))',
}

/**
 * Inline style that PAINTS a container's surface fill, tinted by appearance.
 *
 * The fill comes from the step-keyed `--{Role}-Self-Color` token (e.g.
 * `--Primary-Self-Color`), which resolves to the right colour for the surface's
 * LEVEL automatically — but only when the element also carries `data-surface-step`
 * (so the right step block is in scope). So always pair this with BOTH
 * `data-surface-step={...}` AND `data-appearance={appearance}` on the same element.
 * `ghost` paints nothing (transparent); content remap is handled globally by the
 * DS `[data-surface-step]` rules.
 *
 * (We paint inline because the DS's own background rule is CSS-module-scoped to
 * the One UI <Surface> component's class, which tldraw shape divs don't carry.)
 */
export function surfacePaintStyle(level: SurfaceLevel, appearance: ResolvedAppearance): CSSProperties {
  if (level === 'ghost') return { background: 'transparent' }
  return { background: `var(--${roleLabel(appearance)}-Self-Color, ${SURFACE_FILL[level]})` }
}

// ── Surface step resolution (RFC-0003) ──────────────────────────────────────
//
// The design system makes content context-aware via a NUMERIC step on a 100–2500
// colour scale: `[data-surface-step="N"]` blocks remap every role/content token
// (--Text-High, --Neutral-High, --Primary-Bold, …) AND expose --Surface-Self-Color
// for the fill, all resolved at step N. A bold card sits at step ~700 (dark), so
// its text flips to white automatically. This is what the <Surface> component sets.
//
// We replicate <Surface>'s scale-free `approxResolveStep` (no brand-scale lookup
// needed — bold pins to the canonical 700/1900). Then we stamp data-surface-step
// on every shape so the DS remap reaches it — necessary because tldraw children
// aren't DOM-nested in their container and can't inherit it via the CSS cascade.

const ROOT_STEP_LIGHT = 2500
const ROOT_STEP_DARK = 200
const SCALE_MIN = 100
const SCALE_MAX = 2500
const STEP_BOLD_LIGHT = 700
const STEP_BOLD_DARK = 1900

function clampStep(step: number): number {
  return step < SCALE_MIN ? SCALE_MIN : step > SCALE_MAX ? SCALE_MAX : step
}

/** Scale-free step resolution — mirrors `approxResolveStep` in the One UI
 *  <Surface> component (packages/ui/src/components/Surface/Surface.tsx). */
function approxResolveStep(mode: SurfaceLevel, parentStep: number, darkMode: boolean): number {
  const dir = darkMode ? +1 : -1
  switch (mode) {
    case 'default':
      return darkMode ? ROOT_STEP_DARK : ROOT_STEP_LIGHT
    case 'ghost':
      return parentStep // transparent — inherits the surface behind it
    case 'minimal':
      return clampStep(parentStep + dir * 100)
    case 'subtle':
      return clampStep(parentStep + dir * 200)
    case 'moderate':
      return clampStep(parentStep + dir * 300)
    case 'bold':
      return darkMode ? STEP_BOLD_DARK : STEP_BOLD_LIGHT
  }
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.getAttribute('data-mode') === 'dark'
}

/**
 * The resolved surface STEP that a shape's content sits on, by folding the
 * tldraw container chain (outermost → innermost) through `approxResolveStep`
 * from the page-root step. For a leaf this is its nearest container's step; for
 * a container it's its own step (it includes itself).
 *
 * Stamp the result as `data-surface-step` on the shape's root element so the
 * design system's `[data-surface-step]` rules remap its text/strokes/role tokens
 * for legible contrast — the bridge that makes surfaces context-aware in tldraw,
 * where child shapes aren't DOM-nested inside their container.
 */
export function computeSurfaceStep(editor: Editor, shapeId: TLShapeId): number {
  const dark = isDarkMode()
  // Collect container modes from this shape up to the root.
  const modes: SurfaceLevel[] = []
  let cur = editor.getShape(shapeId)
  let guard = 0
  while (cur && guard++ < 64) {
    const bg = (cur.props as { background?: unknown }).background
    if (typeof bg === 'string' && (SURFACE_LEVELS as readonly string[]).includes(bg)) {
      modes.push(bg as SurfaceLevel)
    }
    cur = cur.parentId ? editor.getShape(cur.parentId as TLShapeId) : undefined
  }
  modes.reverse() // outermost → innermost
  let step = dark ? ROOT_STEP_DARK : ROOT_STEP_LIGHT
  for (const m of modes) step = approxResolveStep(m, step, dark)
  return step
}

/**
 * The surface MODE a shape's content sits on (nearest non-ghost container in the
 * tldraw parent chain), or 'default' if none. Stamped as `data-surface` alongside
 * the step so the DS's mode-keyed component rules (e.g. input borders on a bold
 * surface) adapt too — those key on the attribute value, not the step.
 */
export function computeEffectiveSurface(editor: Editor, shapeId: TLShapeId): SurfaceLevel {
  let cur = editor.getShape(shapeId)
  // Skip the shape itself only if it has no surface of its own (a leaf).
  const selfBg = (cur?.props as { background?: unknown } | undefined)?.background
  if (!(typeof selfBg === 'string' && (SURFACE_LEVELS as readonly string[]).includes(selfBg))) {
    cur = cur?.parentId ? editor.getShape(cur.parentId as TLShapeId) : undefined
  }
  let guard = 0
  while (cur && guard++ < 64) {
    const bg = (cur.props as { background?: unknown }).background
    if (typeof bg === 'string' && (SURFACE_LEVELS as readonly string[]).includes(bg) && bg !== 'ghost') {
      return bg as SurfaceLevel
    }
    cur = cur.parentId ? editor.getShape(cur.parentId as TLShapeId) : undefined
  }
  return 'default'
}

/**
 * The appearance/role a shape's content sits in — the nearest ancestor container
 * (or the shape itself, if it's a container) that has a non-neutral appearance,
 * else 'neutral'. Stamped as `data-appearance` so descendant accent tokens resolve
 * in the right role. `ghost` containers are transparent and pass their parent's
 * appearance through.
 */
export function computeEffectiveAppearance(editor: Editor, shapeId: TLShapeId): ResolvedAppearance {
  let cur = editor.getShape(shapeId)
  let guard = 0
  while (cur && guard++ < 64) {
    const props = cur.props as { background?: unknown; appearance?: unknown }
    const isSurface =
      typeof props.background === 'string' &&
      (SURFACE_LEVELS as readonly string[]).includes(props.background)
    if (isSurface && props.background !== 'ghost') {
      const a = props.appearance
      // An explicit (non-auto) role wins; 'auto'/missing inherits from behind.
      if (
        typeof a === 'string' &&
        a !== 'auto' &&
        (SURFACE_APPEARANCES as readonly string[]).includes(a)
      ) {
        return a as ResolvedAppearance
      }
    }
    cur = cur.parentId ? editor.getShape(cur.parentId as TLShapeId) : undefined
  }
  return 'neutral'
}

/** Reactive hook for a container's OWN resolved step — for setting
 *  `data-surface-step` inside a shape's `component()` render. */
export function useShapeSurfaceStep(shapeId: TLShapeId): number {
  const editor = useEditor()
  return useValue(`surface-step:${shapeId}`, () => computeSurfaceStep(editor, shapeId), [
    editor,
    shapeId,
  ])
}

/** Reactive hook for a shape's resolved appearance role (resolving `auto` to the
 *  surface behind it) — for `data-appearance` and the role fill in `component()`. */
export function useShapeSurfaceAppearance(shapeId: TLShapeId): ResolvedAppearance {
  const editor = useEditor()
  return useValue(`surface-appearance:${shapeId}`, () => computeEffectiveAppearance(editor, shapeId), [
    editor,
    shapeId,
  ])
}

// Legacy background values (the old none/surface/muted scale + PageFrame's
// surface/bg/transparent) → the surface ladder. Used by shape migrations so
// existing persisted canvases upgrade in place instead of being discarded.
const LEGACY_SURFACE_MAP: Record<string, SurfaceLevel> = {
  none: 'ghost',
  transparent: 'ghost',
  surface: 'default',
  muted: 'subtle',
  bg: 'subtle',
}

export function normalizeSurfaceValue(value: unknown): SurfaceLevel {
  if (typeof value === 'string') {
    if ((SURFACE_LEVELS as readonly string[]).includes(value)) return value as SurfaceLevel
    const mapped = LEGACY_SURFACE_MAP[value]
    if (mapped) return mapped
  }
  return 'default'
}

/**
 * Build a prop-migration sequence that upgrades a shape's `background` prop to
 * the surface ladder. Handles both the value remap (none→ghost, surface→default,
 * muted→subtle, bg→subtle, transparent→ghost) and shapes that never had a
 * `background` prop at all (Card) — in which case the value is seeded to 'default'.
 *
 * Retroactive by default, so it applies to records persisted before the
 * surface system existed. If it somehow can't run, the store loader degrades
 * gracefully (discards + reseeds), so this can only preserve work, never break it.
 */
export function surfaceMigrations(shapeType: string) {
  const Versions = createShapePropsMigrationIds(shapeType, { SurfaceScale: 1, AddAppearance: 2 })
  return createShapePropsMigrationSequence({
    sequence: [
      {
        id: Versions.SurfaceScale,
        up: (props: Record<string, unknown>) => {
          props.background = normalizeSurfaceValue(props.background)
        },
      },
      {
        // Add the appearance/role prop (defaults to neutral) to every container.
        id: Versions.AddAppearance,
        up: (props: Record<string, unknown>) => {
          if (
            typeof props.appearance !== 'string' ||
            !(SURFACE_APPEARANCES as readonly string[]).includes(props.appearance)
          ) {
            props.appearance = 'neutral'
          }
        },
      },
    ],
  })
}
