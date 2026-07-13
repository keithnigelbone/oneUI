/**
 * JDSContainer — RN knowledge entry for the layout Container.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Container/interface.ts`.
 *
 * LAYOUT-PRIMITIVE CONTRACT (the reason this meta exists):
 * Container is a presentational max-width / gutter wrapper — it does NOT paint
 * a surface, carry a landmark role, or read surface context. It only constrains
 * its children's width per `variant` (fluid / fixed / full-bleed) + `maxWidth`.
 * It is a11y-transparent (children keep their natural order). For a coloured /
 * tinted background that remaps child tokens, use <Surface>, not Container.
 *
 * `ContainerProps extends LayoutSpacingProps` (`../../utils/layoutStyle.ts`) —
 * native DOES carry the full token-resolved flex-layout prop set (`direction`,
 * `gap`, `padding*`, `align`, `justify`, `wrap`, `flex`), shared with `<Surface>`.
 * These accept a `NativeSpacingKey`/token path ONLY — a bare pixel number/string
 * is not a valid value and is silently dropped by `resolveSpacingPx` at runtime.
 */

import { defineComponent } from '../defineComponent';

export const JDSContainer = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Container',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Presentational layout wrapper — constrains children width via variant (fluid / fixed / full-bleed) + maxWidth, plus the shared token-resolved flex-layout props (direction/gap/padding*/align/justify/wrap/flex). No surface paint, no landmark role, a11y-transparent. Use <Surface> when you need a tinted background that remaps child tokens.',

  propsSchema: {
    $id: 'jds.kb.rn.Container',
    type: 'object',
    properties: {
      variant: {
        enum: ['fluid', 'fixed', 'full-bleed'],
        default: 'fluid',
        description: 'fluid = grows with parent; fixed = capped at maxWidth; full-bleed = edge-to-edge.',
      },
      maxWidth: { description: 'Width cap — number (px) or string (dim). Honoured for variant="fixed".' },
      direction: {
        enum: ['row', 'column'],
        description: 'Flex main-axis direction.',
      },
      gap: {
        type: 'string',
        description:
          'Token-only spacing between children — a NativeSpacingKey (e.g. "6"), a Figma "dimensions/spacings/N" path, or a "Spacing-N" alias. NEVER a raw pixel number/string — resolveSpacingPx silently drops unresolvable values.',
      },
      padding: { type: 'string', description: 'Token-only padding on all sides. Same value shape as `gap`.' },
      paddingX: { type: 'string', description: 'Token-only horizontal padding. Same value shape as `gap`.' },
      paddingY: { type: 'string', description: 'Token-only vertical padding. Same value shape as `gap`.' },
      paddingTop: { type: 'string', description: 'Token-only. Same value shape as `gap`.' },
      paddingRight: { type: 'string', description: 'Token-only. Same value shape as `gap`.' },
      paddingBottom: { type: 'string', description: 'Token-only. Same value shape as `gap`.' },
      paddingLeft: { type: 'string', description: 'Token-only. Same value shape as `gap`.' },
      align: {
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
        description: 'Cross-axis alignment — maps to `alignItems`.',
      },
      justify: {
        enum: ['start', 'center', 'end', 'between', 'around', 'evenly'],
        description: 'Main-axis distribution — maps to `justifyContent`.',
      },
      wrap: { type: 'boolean', description: 'Flex-wrap.' },
      flex: { type: 'number', description: 'Flex-grow factor — a plain number IS valid here (not a spacing token).' },
      children: { description: 'Arbitrary content; layout order preserved.' },
    },
  },

  tokens: {
    spacing: ['margin', 'gutter'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: { accepts: ['*'], cardinality: 'multiple', description: 'Any content — Container only constrains width.' },
    },
  },

  a11y: {
    accessibilityRole: 'none', // presentational; children keep their natural a11y order
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-container-v4',
    keyHistory: [],
    variantProperties: { Component: 'Container' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: false,
  },

  tags: ['layout', 'container', 'structural'],
} as const);
