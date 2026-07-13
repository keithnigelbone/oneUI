/**
 * JDSSeparator — RN knowledge entry for the decorative Separator.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Separator/interface.ts`.
 *
 * DECORATIVE-ONLY CONTRACT (the reason this meta exists):
 * Separator is the content-less peer of Divider — a hairline rule with NO
 * label, icon, appearance, size, or attention props. It is hidden from the
 * accessibility tree (`accessible: false` / aria-hidden); the line colour
 * resolves from `role.content.strokeLow` (neutral) against the parent
 * <Surface>. When you need an inline label or icon, or a coloured/emphasised
 * rule, use Divider instead.
 */

import { defineComponent } from '../defineComponent';

export const JDSSeparator = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Separator',
  importPath: '@oneui/ui-native',
  // GATED: implementation complete but not yet exported from the public barrel.
  // Mirrors GATED_COMPONENTS in packages/ui-native/scripts/copy-to-root-dist.mjs.
  status: 'planned',
  description:
    'Decorative hairline rule (horizontal or vertical). No content, no appearance — hidden from assistive tech. Stroke resolves from neutral strokeLow against the parent <Surface>. Use Divider for a labelled / emphasised separator.',

  propsSchema: {
    $id: 'jds.kb.rn.Separator',
    type: 'object',
    properties: {
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
    },
  },

  tokens: {
    color: ['neutral'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'none', // decorative — accessible: false / aria-hidden
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: false,
  },

  figma: {
    componentKey: 'jds-separator-v4',
    keyHistory: [],
    variantProperties: { Component: 'Separator' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['layout', 'separator', 'decorative', 'surface-aware'],
} as const);
