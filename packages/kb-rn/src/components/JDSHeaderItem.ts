/**
 * JDSHeaderItem — RN knowledge entry for HeaderItem.
 *
 * Mirrors the native-owned prop contract at
 * `packages/ui-native/src/components/HeaderNative/interface.ts`
 * (`HeaderItemProps`). Figma source of truth: Header.Item (3342:59395).
 *
 * Belongs only inside HeaderNative.SecondaryNav — see JDSHeaderNative's
 * composition contract. Figma nests the real componentProperties (label,
 * active, attention, start/end, visuallyAlignToStart) one level inside a
 * leading-dot ".Header.Item" variant wrapper; the codegen registry expects
 * that flattened onto the outer instance.
 */

import { defineComponent } from '../defineComponent';

export const JDSHeaderItem = defineComponent({
  schemaVersion: '5.0.0',
  name: 'HeaderItem',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'A single SecondaryNav tab (Figma Header.Item). Renders a text label with optional start/end icon slots; `active` selects the current tab.',

  propsSchema: {
    $id: 'jds.kb.rn.HeaderItem',
    type: 'object',
    required: ['value', 'children'],
    properties: {
      value: { type: 'string', description: 'Stable tab identifier (not visible). Figma has no equivalent — derive from the label.' },
      children: { type: 'string', description: 'Visible tab label text.' },
      active: { type: 'boolean', default: false, description: 'Selected/current tab.' },
      attention: {
        enum: ['low', 'medium', 'high'],
        default: 'low',
        description: 'Label emphasis. Figma commonly sets medium for the active tab, low for the rest.',
      },
      start: { description: 'Leading icon slot.' },
      startSize: { enum: ['none', 'S', 'M'], default: 'none' },
      end: { description: 'Trailing icon slot.' },
      endSize: { enum: ['none', 'S', 'M'], default: 'none' },
      visuallyAlignToStart: { type: 'boolean', default: false, description: 'Left-aligns the label instead of centering it.' },
      disabled: { type: 'boolean', default: false },
      onPress: { description: 'RN press handler.' },
      'aria-label': { type: 'string' },
    },
  },

  tokens: {
    color: ['neutral'],
    typography: ['label.S'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'tab',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-header-item-v1',
    keyHistory: [],
    variantProperties: { Component: 'Header.Item' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'header', 'tab', 'compound'],
} as const);
