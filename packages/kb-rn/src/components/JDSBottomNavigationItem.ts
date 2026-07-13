/**
 * JDSBottomNavigationItem — fixed-slots child of BottomNavigation. One Icon
 * (required) + optional Label, optional Badge. The child shape that consumer
 * AJV validators check before code-emission.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/BottomNavigationItem/interface.ts`.
 * `TAB_BAR_ITEM_SHARED_PROPS` (kb-core) does not carry `icon` — it is
 * extended here to match the real (required) prop.
 */

import { TAB_BAR_ITEM_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBottomNavigationItem = defineComponent({
  schemaVersion: '5.0.0',
  name: 'BottomNavigationItem',
  importPath: '@oneui/ui-native',
  status: 'beta',
  description:
    'Single tab inside a BottomNavigation. Required icon glyph + optional label; optional activeIcon (swapped in when selected) and Badge for unread/notification counts.',

  propsSchema: {
    $id: 'jds.kb.rn.BottomNavigationItem',
    type: 'object',
    properties: {
      ...TAB_BAR_ITEM_SHARED_PROPS,
      icon: {
        description: 'Required glyph — a semantic icon name, ReactElement, or JDS icon component reference (e.g. `icon={IcHome}`).',
      },
      activeIcon: {
        description: 'Optional glyph swapped in when the item is active (same value shape as `icon`).',
      },
      value: { type: 'string', description: "Selection value — matched against the parent BottomNavigation's `value`." },
      appearance: {
        description: 'Forwarded from the parent BottomNavigation context; not usually set per-item.',
      },
      labelType: { description: 'Label visibility policy, forwarded from the parent BottomNavigation context.' },
    },
    required: ['icon'],
  },

  tokens: {
    color: ['neutral', 'primary'],
    surface: ['ghost', 'subtle'],
    typography: ['label.XS', 'label.S'],
    spacing: ['3XS', '2XS', 'XS', 'S'],
    motion: ['motion.duration.discreet.short'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      icon: { accepts: ['Icon'], cardinality: 'single' },
      label: { accepts: ['#string', 'Text'], cardinality: 'single' },
      badge: { accepts: ['Badge', 'CounterBadge'], cardinality: 'optional' },
    },
  },

  a11y: {
    accessibilityRole: 'tab',
    accessibilityState: ['selected', 'disabled'],
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-bottomnav-item-v4',
    // Preserve the former key so Figma reverse-lookup keeps resolving old files.
    keyHistory: ['jds-tabbar-item-v4'],
    variantProperties: { Component: 'BottomNavigationItem' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'chassis'],
} as const);
