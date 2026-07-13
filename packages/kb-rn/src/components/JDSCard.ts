/**
 * JDSCard — composite container the Coffee Shop / production app surfaces use
 * constantly. Maps to Container + Surface in @oneui/ui-native today; planned
 * to ship as its own component (`@oneui/ui-native/components/Card`) post v5.0.
 *
 * Status: alpha (not yet a first-class native component). Consumers should
 * compile this to <Surface><Container>...</Container></Surface> with the
 * declared mode + appearance until the dedicated component ships.
 */

import { defineComponent } from '../defineComponent';

export const JDSCard = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Card',
  importPath: '@oneui/ui-native',
  status: 'alpha',
  description:
    'Composite container. Combines a Surface boundary (the tinted fill), a Container (padding + shape), and a slot tree (header / media / body / footer / actions).',

  propsSchema: {
    $id: 'jds.kb.rn.Card',
    type: 'object',
    properties: {
      mode: { enum: ['minimal', 'subtle', 'moderate', 'bold', 'elevated'], default: 'subtle' },
      appearance: {
        enum: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg'],
        default: 'neutral',
      },
      shape: {
        enum: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
        default: 'L',
      },
      padding: {
        enum: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        default: 'L',
      },
      interactive: {
        type: 'boolean',
        default: false,
        description: 'When true, the whole card becomes a Pressable. Inserts focus halo.',
      },
      decorativeStroke: {
        type: 'boolean',
        default: false,
        'x-jds-suggestion':
          'Tinted Card fills are their own boundary. Adding a stroke duplicates the cue. Only enable when fill contrast < 1.5:1 vs page.',
        'x-jds-severity': 'warn',
      },
      children: { description: 'Card.Header / Card.Media / Card.Body / Card.Footer / Card.Actions in any order.' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg'],
    surface: ['minimal', 'subtle', 'moderate', 'bold', 'elevated'],
    spacing: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    shape: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    elevation: [0, 1, 2],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      header: { accepts: ['Text', 'View', '*'], cardinality: 'optional' },
      media: { accepts: ['Image', 'View'], cardinality: 'optional' },
      body: { accepts: ['Text', 'View', '*'], cardinality: 'optional' },
      footer: { accepts: ['Text', 'View', '*'], cardinality: 'optional' },
      actions: { accepts: ['Button', 'IconButton'], cardinality: 'multiple' },
    },
  },

  a11y: {
    accessibilityRole: 'none',     // changes to 'button' when interactive=true
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-card-v4',
    keyHistory: [],
    variantProperties: { Component: 'Card' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['container', 'chassis', 'composition'],
} as const);
