/**
 * JDSSurface — the colour-boundary primitive. Every coloured / dark / brand-
 * tinted section MUST be wrapped in <Surface> so descendants pick up the
 * resolved role tokens. This is the keystone of OneUI's surface-context system.
 *
 * Implementation lives in `@oneui/ui-native/theme/SurfaceContext.tsx` (RN) and
 * `@oneui/ui/components/Surface` (web) — both honour the same 7 modes.
 *
 * `SurfaceProps extends LayoutSpacingProps` (`../../utils/layoutStyle.ts`) — RN
 * Surface carries the SAME token-resolved flex-layout props as Container
 * (`direction`, `gap`, `padding*`, `align`, `justify`, `wrap`, `flex`), so it can
 * act as a painted flex container without an extra Container wrapper. Values
 * are token-only (NativeSpacingKey / token path) — a bare pixel is silently
 * dropped by `resolveSpacingPx`.
 */

import { defineComponent } from '../defineComponent';

export const JDSSurface = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Surface',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Colour-boundary wrapper. Sets [data-surface] on web, pushes a new SurfaceContext on RN. Children re-resolve role tokens at the surface boundary — zero per-component inversion logic. Also carries the shared token-resolved flex-layout props (direction/gap/padding*/align/justify/wrap/flex).',

  propsSchema: {
    $id: 'jds.kb.rn.Surface',
    type: 'object',
    properties: {
      mode: {
        enum: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'],
        default: 'ghost',
        description: 'Surface mode. Resolves the boundary step relative to the parent step.',
      },
      appearance: {
        enum: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'neutral',
        description: 'Which role fills the surface. Defaults to neutral.',
      },
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
      children: { description: 'Any ReactNode — Surface is a container.' },
      style: {
        description: 'Layout style only. backgroundColor is forbidden — the surface mode IS the background.',
        'x-jds-suggestion': "Don't set backgroundColor on a Surface — pick a different `mode` or `appearance` instead.",
        'x-jds-severity': 'warn',
      },
    },
    required: ['mode'],
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'],
  },

  composition: {
    childKind: 'variadic',
    variadic: { accepts: ['*'], min: 0, max: 10000 },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-surface-v4',
    keyHistory: [],
    variantProperties: { Component: 'Surface' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['layout', 'chassis', 'mandatory-wrapper'],
} as const);
