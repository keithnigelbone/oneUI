/**
 * JDSInputDynamicText — RN knowledge entry for the InputDynamicText row.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/InputDynamicText/interface.ts`.
 *
 * HELPER-ROW CONTRACT (the reason this meta exists):
 * The optional row beneath an input carrying leading copy (`content`, e.g. a
 * character counter) and/or a trailing action (`end` → an internal low-attention
 * condensed <Button> wired to `onEndClick`). The row hides entirely when BOTH
 * are empty; when only `end` is set it right-aligns the trailing slot. The
 * leading copy is the input's description — it exposes `role="text"` with an
 * optional live region (`aria-live`, e.g. for live character counts). Usually
 * consumed via InputField's `dynamicText` / `helperButton` shorthand.
 */

import { defineComponent } from '../defineComponent';

export const JDSInputDynamicText = defineComponent({
  schemaVersion: '5.0.0',
  name: 'InputDynamicText',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Helper row under an input — leading copy (e.g. char counter) + optional trailing low-attention condensed Button. Hides when both empty. Leading copy supports a live region for dynamic updates. Three sizes (s/m/l).',

  propsSchema: {
    $id: 'jds.kb.rn.InputDynamicText',
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Leading copy (Body / Text-Medium). Rendered when non-empty.' },
      end: { type: 'string', description: 'Trailing action label — rendered as a low-attention condensed Button.' },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Maps copy to Body XS/S/M and the trailing Button to s/m/l.' },
      disabled: { type: 'boolean', default: false, description: 'Disables the trailing Button and dims the copy to Text-Low.' },
      'aria-live': { enum: ['off', 'polite', 'assertive'], description: 'Live region for the leading copy (e.g. char-count updates).' },
      onEndClick: { description: 'Handler for the trailing Button.' },
      endAriaLabel: { type: 'string', description: 'Accessible name override for the trailing control.' },
    },
  },

  tokens: {
    color: ['neutral', 'primary'],
    typography: ['body.XS', 'body.S', 'body.M', 'label.S', 'label.M'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'text',
    accessibilityState: ['disabled'],
    accessibleNameSource: 'children', // leading `content`
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-input-dynamic-text-v4',
    keyHistory: [],
    variantProperties: { Component: 'InputDynamicText' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'helper', 'input'],
} as const);
